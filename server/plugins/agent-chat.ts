import { getOrgContext } from "@agent-native/core/org";
import {
  createAgentChatPlugin,
  loadActionsFromStaticRegistry,
} from "@agent-native/core/server";
import { createError } from "h3";

import actionsRegistry from "../../.generated/actions-registry.js";
import { consumeAiBudget } from "../lib/ai-budget";
import {
  searchConversationReferences,
  validateConversationReferences,
} from "../lib/composer-references.js";

const INITIAL_TOOL_NAMES = [
  "view-screen",
  "navigate",
  "list-events",
  "get-event-coverage",
  "find-qualified-replacements",
  "generate-repair-proposal",
  "ask-question",
];

export default createAgentChatPlugin({
  appId: "crewcover",
  mentionProviders: {
    chats: {
      label: "composerSources.group",
      search: searchConversationReferences,
    },
  },
  prepareRequest: async ({
    references,
    ownerEmail,
    internalContinuation,
    message,
    attachments,
  }) => {
    if (message.length > 6000 || attachments.length > 0)
      throw createError({
        statusCode: 400,
        statusMessage:
          "Use a scheduling message up to 6000 characters without attachments.",
      });
    await consumeAiBudget(ownerEmail, internalContinuation);
    await validateConversationReferences(references);
  },
  actions: loadActionsFromStaticRegistry(actionsRegistry),
  mcp: { connectorCatalog: [], appApprovalPage: true },
  initialToolNames: INITIAL_TOOL_NAMES,
  frameworkTools: {
    preset: "minimal",
    database: "off",
    extensions: false,
    automation: false,
    web: false,
  },
  codeExecution: { production: "off" },
  a2aAgentDelegation: false,
  resolveOrgId: async (event) => (await getOrgContext(event)).orgId,
  systemPrompt: `You are CrewCover's event staffing assistant. You and the organizer use the SAME typed actions and persisted schedule.
Always use list-events and get-event-coverage for current facts. The selected event id and workspace tab are in navigation; when absent, use the sole event returned by list-events. Never invent volunteers, eligibility, assignments, or coverage. For display, read startLocal and endLocal from coverage.shifts in the event's timeZone. The raw start/end instants are UTC storage values, not local display labels.
Coverage gaps measure volunteer positions. Use durationHours for shift duration. A gap count of one means one uncovered position. Mention hours only when read from durationHours; explain replacement counts in positions.
For cancellations, inspect actual active assignments. For repair requests, read current coverage, call find-qualified-replacements when explaining a gap, then generate-repair-proposal. That action deterministically allocates candidates across vacancies without double-booking. Explain the actual proposal, eligibility reasons, before/after coverage and unresolved gaps. Link to /operations?view=repairs for review. Stop and ask the organizer to approve. Never claim a proposed repair has been applied.
Only call approve-repair-proposal after the organizer explicitly approves THAT proposal; framework approval is mandatory. Never bypass validation or use SQL/code for changes. Re-read get-event-coverage after any write and after a manual user change. A stale proposal must be regenerated, never forced through. Report validation errors and unavailable candidates honestly. The conference and volunteer names are fictional demo data.
Keep replies brief and useful. Scheduling remains available through the Repair Center if inference is unavailable.`,
});

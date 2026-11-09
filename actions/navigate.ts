import { defineAction, fail } from "@agent-native/core/action";
import { writeAppStateForCurrentTab } from "@agent-native/core/application-state";
import { z } from "zod";

export default defineAction({
  description:
    "Navigate the UI to a specific view or path. Writes a navigate command to application state which the UI reads and auto-deletes.",
  schema: z.object({
    view: z
      .enum([
        "operations",
        "home",
        "chat",
        "ask",
        "agent",
        "settings",
        "team",
        "database",
        "observability",
        "extensions",
      ])
      .optional()
      .describe("Application view to navigate to"),
    path: z
      .string()
      .startsWith("/")
      .max(500)
      .refine(
        (p) => !p.startsWith("//") && !p.includes("\\"),
        "Use an application-relative path",
      )
      .optional()
      .describe("Application-relative URL path"),
    threadId: z.string().optional().describe("Chat thread ID to open"),
    eventId: z.string().max(100).optional().describe("Selected event id"),
    workspaceView: z
      .enum(["overview", "schedule", "volunteers", "repairs", "activity"])
      .optional()
      .describe("Event operations tab"),
  }),
  http: false,
  run: async (args) => {
    if (!args.view && !args.path) {
      return fail("Choose a view or application path.", {
        statusCode: 400,
        errorCode: "INVALID_NAVIGATION",
      });
    }
    const nav: Record<string, string> = {};
    if (args.view) nav.view = args.view;
    if (args.path) nav.path = args.path;
    if (args.threadId) nav.threadId = args.threadId;
    if (args.eventId) nav.eventId = args.eventId;
    if (args.workspaceView) nav.workspaceView = args.workspaceView;
    if (!args.path && (args.view === "operations" || args.view === "home")) {
      const query = new URLSearchParams({
        view: args.workspaceView ?? "overview",
      });
      if (args.eventId) query.set("eventId", args.eventId);
      nav.path = "/operations?" + query.toString();
    }
    nav._writeId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await writeAppStateForCurrentTab("navigate", nav);
    return `Navigating to ${args.view || args.path}`;
  },
});

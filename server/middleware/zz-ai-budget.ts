import { getSession } from "@agent-native/core/server";
import { createError, defineEventHandler, getRequestURL } from "h3";

import { consumeAiBudget } from "../lib/ai-budget";

// Main chat is gated at prepareRequest. Auxiliary inference uses the same
// persisted deployment-wide daily budget, including across function instances.
export default defineEventHandler(async (event) => {
  if (event.req.method !== "POST") return;
  const path = getRequestURL(event).pathname;
  const auxiliary =
    path === "/_agent-native/agent-chat/generate-title" ||
    path.startsWith("/_agent-native/transcribe-voice") ||
    path.startsWith("/_agent-native/realtime-voice");
  if (!auxiliary) return;
  const session = await getSession(event);
  if (!session)
    throw createError({
      statusCode: 401,
      statusMessage: "Sign in to use AI features.",
    });
  await consumeAiBudget(session.email, false, "auxiliary");
});

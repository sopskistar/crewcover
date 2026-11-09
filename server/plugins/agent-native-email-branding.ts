import { defineAppConfig } from "@agent-native/core/server";

export default defineAppConfig({
  app: {
    // This name appears in transactional emails. Change it to your product name.
    id: "crewcover",
    name: "CrewCover",
    // The source template keeps a renamed app from inheriting first-party email branding.
    sourceTemplate: "chat",
    // Keep the template's authenticated entry explicit after renaming the app.
    homePath: "/operations",
    // Optional: use your own absolute HTTPS logo URL in transactional emails.
    // logoUrl: "https://example.com/logo.png",
  },
  agent: {
    engine: "ai-sdk:google",
    model: "gemini-3.1-flash-lite",
    builtInEngines: ["ai-sdk:google", "ai-sdk:openrouter"],
    preferBringYourOwnKey: true,
    mainChatMaxOutputTokens: 2048,
    maxOutputTokens: 2048,
    runSoftTimeoutMs: 90000,
  },
  migration: { releaseMigrations: true },
});

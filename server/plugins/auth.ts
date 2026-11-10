import { createToolkitAuthPlugin } from "@agent-native/toolkit/app/auth/server";

export default createToolkitAuthPlugin({
  workspaceAppPublicPaths: ["/", "/api/health"],
  publicPaths: ["/", "/api/health"],
  rootAuth: false,
  marketing: false,
});

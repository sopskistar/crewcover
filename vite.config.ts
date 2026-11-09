import { agentNative } from "@agent-native/core/vite";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";

const reactRouterPlugins = reactRouter as unknown as () => any[];
const agentNativePlugins = agentNative as unknown as (
  options?: Parameters<typeof agentNative>[0],
) => any[];
export default defineConfig({
  server: {
    watch: {
      // Test report HTML must not reload the working application during QA.
      ignored: [
        "**/playwright-report/**",
        "**/test-results/**",
        "**/.impeccable/review/**",
        "**/.tmp/**",
      ],
    },
  },
  optimizeDeps: {
    entries: [
      "app/entry.client.tsx",
      "app/root.tsx",
      "app/components/layout/{Layout,Sidebar}.tsx",
      "app/components/chat/ChatRouteContent.tsx",
      "app/routes/{home,chat.$threadId}.tsx",
    ],
  },
  plugins: [
    ...reactRouterPlugins(),
    ...agentNativePlugins({
      ssrStubs: ["shiki"],
    }),
    {
      name: "crewcover-current-markdown-dependencies",
      enforce: "post",
      configResolved(config) {
        // Core 0.226.0 preloads an old nested dependency name. The installed
        // hast-util-to-jsx-runtime uses style-to-object. Remove only the stale
        // optimization hint; normal dependency discovery/imports stay intact.
        if (config.optimizeDeps.include)
          config.optimizeDeps.include = config.optimizeDeps.include.filter(
            (id) =>
              id !==
              "@agent-native/toolkit > react-markdown > hast-util-to-jsx-runtime > style-to-js",
          );
      },
    },
  ],
});

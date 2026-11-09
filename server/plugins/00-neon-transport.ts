import { defineNitroPlugin } from "@agent-native/core";
import { neonConfig } from "@neondatabase/serverless";
import WebSocket from "ws";

// Vercel Nitro needs an explicit Node transport; standalone Node24 can use its
// native implementation. Both use the framework pool and preserve TLS.
if (process.env.VERCEL === "1" || typeof globalThis.WebSocket === "undefined")
  neonConfig.webSocketConstructor = WebSocket;
export default defineNitroPlugin(() => {});

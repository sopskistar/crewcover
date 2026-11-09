import { buildDeepLink } from "@agent-native/core/server";
export function eventLink(
  eventId: string,
  workspaceView: string,
  label: string,
) {
  return {
    url: buildDeepLink({
      app: "crewcover",
      view: "operations",
      params: { eventId, workspaceView },
    }),
    label,
  };
}

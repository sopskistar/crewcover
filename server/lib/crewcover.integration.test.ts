import { withMigrationRuntime, getDbExec, sql } from "@agent-native/core/db";
import { beforeAll, describe, it, expect } from "vitest";

import approvalAction from "../../actions/approve-repair-proposal";
import cancelAction from "../../actions/cancel-assignment";
import proposalAction from "../../actions/generate-repair-proposal";
import getCoverageAction from "../../actions/get-event-coverage";
import {
  cancelAssignment,
  coverage,
  generateProposal,
  decideProposal,
} from "../../shared/scheduling";
import migrate from "../plugins/db";
import { consumeAiBudget } from "./ai-budget";
import {
  seedDemo,
  readEvent,
  mutateEvent,
  requireOwner,
} from "./crewcover-store";
const owner = "integration@example.test";
const ctx = { userEmail: owner, caller: "http" as const };
beforeAll(async () => {
  await withMigrationRuntime(async () => {
    await migrate({} as Parameters<typeof migrate>[0]);
  });
}, 60000);
describe("persistent domain and shared defineAction contract", () => {
  it("rejects anonymous inference and enforces persisted hourly budgets", async () => {
    await expect(consumeAiBudget(null)).rejects.toThrow("Sign in");
    for (let i = 0; i < 8; i++)
      await consumeAiBudget("budget-test@example.test");
    await expect(consumeAiBudget("budget-test@example.test")).rejects.toThrow(
      "budget reached",
    );
    for (let i = 0; i < 12; i++)
      await consumeAiBudget("budget-test@example.test", false, "auxiliary");
    await expect(
      consumeAiBudget("budget-test@example.test", false, "auxiliary"),
    ).rejects.toThrow("budget reached");
  });
  it("bounds deployment-wide inference across separate authenticated users", async () => {
    // The preceding test admitted 20 requests; rejected transactions did not
    // increment the daily counter. Forty more requests fill the shared cap.
    for (let i = 0; i < 40; i++)
      await consumeAiBudget(`global-budget-${i}@example.test`);
    await expect(consumeAiBudget("new-user@example.test")).rejects.toThrow(
      "budget reached",
    );
  });
  it("seeds idempotently and reads saved rows through framework SQL", async () => {
    const a = await seedDemo(owner),
      b = await seedDemo(owner);
    expect(a.id).toBe(b.id);
    const state = await readEvent(owner, a.id);
    expect(state.volunteers).toHaveLength(20);
    expect(coverage(state).percentage).toBe(100);
    const result = await getDbExec().execute(
      sql`SELECT count(*)::integer AS total FROM cc_assignments`,
    );
    expect(result.rows[0]?.total).toBe(20);
  });
  it("rejects anonymous action access and cross-owner event ids", async () => {
    expect(() => requireOwner(undefined)).toThrow("Sign in");
    const event = await seedDemo(owner);
    await expect(readEvent("different@example.test", event.id)).rejects.toThrow(
      "not found",
    );
    await expect(
      getCoverageAction.run({ eventId: event.id }, { caller: "http" }),
    ).rejects.toThrow("Sign in");
  });
  it("executes actual typed actions used by the UI and agent against persisted data", async () => {
    const { id } = await seedDemo(owner, true);
    for (const assignmentId of ["a-1", "a-3", "a-5"])
      await cancelAction.run(
        { eventId: id, assignmentId, reason: "Integration test" },
        ctx,
      );
    const before = await getCoverageAction.run({ eventId: id }, ctx);
    expect(before.coverage.percentage).toBe(85);
    const { proposal } = await proposalAction.run({ eventId: id }, ctx);
    expect(proposal.recommendations).toHaveLength(3);
    await approvalAction.run({ eventId: id, proposalId: proposal.id }, ctx);
    expect((await readEvent(owner, id)).decisions).toHaveLength(1);
    expect(
      (await getCoverageAction.run({ eventId: id }, ctx)).coverage.percentage,
    ).toBe(100);
    await expect(
      approvalAction.run({ eventId: id, proposalId: proposal.id }, ctx),
    ).rejects.toThrow("already been decided");
  });
  it("serializes conflicting approvals and persists one decision", async () => {
    const { id } = await seedDemo(owner, true);
    await mutateEvent(owner, id, (s) =>
      cancelAssignment(s, "a-1", "Test", owner),
    );
    const proposal = await mutateEvent(owner, id, (s) =>
      generateProposal(s, owner),
    );
    const results = await Promise.allSettled([
      mutateEvent(owner, id, (s) =>
        decideProposal(s, proposal.id, "approved", owner),
      ),
      mutateEvent(owner, id, (s) =>
        decideProposal(s, proposal.id, "approved", owner),
      ),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect((await readEvent(owner, id)).decisions).toHaveLength(1);
  });
  it("rolls back stale approvals after a manual change", async () => {
    const { id } = await seedDemo(owner, true);
    await mutateEvent(owner, id, (s) =>
      cancelAssignment(s, "a-1", "Test", owner),
    );
    const proposal = await mutateEvent(owner, id, (s) =>
      generateProposal(s, owner),
    );
    await mutateEvent(owner, id, (s) =>
      cancelAssignment(s, "a-3", "Manual change", owner),
    );
    await expect(
      mutateEvent(owner, id, (s) =>
        decideProposal(s, proposal.id, "approved", owner),
      ),
    ).rejects.toThrow("schedule changed");
    const state = await readEvent(owner, id);
    expect(state.decisions).toHaveLength(0);
    expect(coverage(state).percentage).toBe(90);
  });
});

it("persists confirmed vacancy fills through the shared action and rejects stale, duplicate and cross-owner writes", async () => {
  const { default: assignAction } =
    await import("../../actions/assign-volunteer");
  const { id } = await seedDemo(owner, true);
  await cancelAction.run(
    { eventId: id, assignmentId: "a-1", reason: "Vacancy fill test" },
    ctx,
  );
  await expect(
    assignAction.run({ eventId: id, shiftId: "s-1", volunteerId: "v-2" }, ctx),
  ).rejects.toThrow("Missing Registration");
  await expect(
    assignAction.run(
      { eventId: id, shiftId: "s-1", volunteerId: "v-15" },
      { caller: "http" },
    ),
  ).rejects.toThrow("Sign in");
  await expect(
    assignAction.run(
      { eventId: id, shiftId: "s-1", volunteerId: "v-15" },
      { caller: "http", userEmail: "other@example.test" },
    ),
  ).rejects.toThrow("not found");
  await assignAction.run(
    { eventId: id, shiftId: "s-1", volunteerId: "v-15" },
    ctx,
  );
  expect(coverage(await readEvent(owner, id)).percentage).toBe(100);
  await expect(
    assignAction.run({ eventId: id, shiftId: "s-1", volunteerId: "v-15" }, ctx),
  ).rejects.toThrow("fully covered");
  expect((await readEvent(owner, id)).cancellations).toHaveLength(1);
});

import { describe, it, expect } from "vitest";

import { createDemo } from "./demo";
import {
  overlap,
  coverage,
  candidates,
  cancelAssignment,
  generateProposal,
  decideProposal,
  assignVolunteer,
  exclusionReasons,
  validInterval,
} from "./scheduling";
const owner = "organizer@example.test";
describe("deterministic scheduling", () => {
  it("labels vacancy counts separately from shift duration", () => {
    const state = createDemo(owner);
    cancelAssignment(state, "a-1", "Test", owner);
    const current = coverage(state);
    expect(current.unit).toBe("volunteer positions");
    expect(current.shifts[0]).toMatchObject({
      gap: 1,
      uncoveredPositions: 1,
      durationHours: 4,
      timeZone: "Africa/Lagos",
      startLocal: "14 Nov 2026, 09:00",
      endLocal: "14 Nov 2026, 13:00",
    });
  });
  it("starts fully covered with valid seed assignments", () => {
    const s = createDemo(owner);
    expect(coverage(s)).toMatchObject({
      percentage: 100,
      covered: 20,
      gaps: 0,
    });
    for (const a of s.assignments) {
      const other = structuredClone(s);
      other.assignments = other.assignments.filter((x) => x.id !== a.id);
      expect(
        exclusionReasons(
          other,
          s.volunteers.find((v) => v.id === a.volunteerId)!,
          s.shifts.find((x) => x.id === a.shiftId)!,
        ),
      ).toEqual([]);
    }
  });
  it("uses half-open boundaries and rejects malformed intervals", () => {
    expect(
      overlap(
        { start: "2026-01-01T08:00Z", end: "2026-01-01T12:00Z" },
        { start: "2026-01-01T12:00Z", end: "2026-01-01T16:00Z" },
      ),
    ).toBe(false);
    expect(validInterval({ start: "bad", end: "bad" })).toBe(false);
  });
  it("checks qualifications, full availability, overlap and hours", () => {
    const s = createDemo(owner);
    const v = s.volunteers[0]!,
      shift = s.shifts[0]!;
    expect(exclusionReasons(s, v, shift)).toContain("Overlapping assignment");
    expect(exclusionReasons(s, s.volunteers[1]!, shift)).toContain(
      "Missing Registration qualification",
    );
    v.maxHours = 1;
    expect(exclusionReasons(s, v, s.shifts[5]!)).toContain(
      "Would exceed working-hour limit",
    );
    v.availability = [];
    expect(exclusionReasons(s, v, shift)).toContain(
      "Not available for the full shift",
    );
  });
  it("cancellation changes coverage and excludes the cancelling volunteer", () => {
    const s = createDemo(owner);
    cancelAssignment(s, "a-1", "Unable to attend", owner);
    expect(coverage(s).percentage).toBe(95);
    expect(
      candidates(s, "s-1").excluded.find((v) => v.volunteerId === "v-1")!
        .reasons,
    ).toContain("Unavailable or cancelled for this time");
    expect(() => cancelAssignment(s, "a-1", "Again", owner)).toThrow(
      "already cancelled",
    );
  });
  it("ranks reproducibly and allocates candidates without conflicts", () => {
    const s = createDemo(owner);
    for (const id of ["a-1", "a-3", "a-5"])
      cancelAssignment(s, id, "Demo cancellation", owner);
    expect(coverage(s).percentage).toBe(85);
    expect(candidates(s, "s-1").eligible).toEqual(
      candidates(s, "s-1").eligible,
    );
    const p = generateProposal(s, owner);
    expect(p.recommendations.length).toBe(3);
    expect(coverage(s).percentage).toBe(85);
    decideProposal(s, p.id, "approved", owner);
    expect(coverage(s).percentage).toBe(100);
    expect(s.decisions).toHaveLength(1);
    expect(() => decideProposal(s, p.id, "approved", owner)).toThrow(
      "already been decided",
    );
  });
  it("reports insufficient candidates honestly", () => {
    const s = createDemo(owner);
    cancelAssignment(s, "a-1", "Test", owner);
    s.volunteers.forEach((v) => (v.unavailable = true));
    const p = generateProposal(s, owner);
    expect(p.recommendations).toHaveLength(0);
    expect(p.unresolved).toEqual([{ shiftId: "s-1", count: 1 }]);
    expect(p.after).toBe(95);
  });
  it("rejects stale approval after a manual schedule change", () => {
    const s = createDemo(owner);
    cancelAssignment(s, "a-1", "Test", owner);
    const p = generateProposal(s, owner);
    cancelAssignment(s, "a-3", "Manual change", owner);
    expect(() => decideProposal(s, p.id, "approved", owner)).toThrow(
      "schedule changed",
    );
    expect(s.decisions).toHaveLength(0);
  });
  it("rejecting makes no assignment changes", () => {
    const s = createDemo(owner);
    cancelAssignment(s, "a-1", "Test", owner);
    const p = generateProposal(s, owner),
      before = structuredClone(s.assignments);
    decideProposal(s, p.id, "rejected", owner);
    expect(s.assignments).toEqual(before);
    expect(p.status).toBe("rejected");
  });
  it("rejects full shifts and invalid manual assignments", () => {
    const s = createDemo(owner);
    expect(() => assignVolunteer(s, "s-1", "v-11", owner)).toThrow(
      "already fully covered",
    );
    cancelAssignment(s, "a-1", "Test", owner);
    expect(() => assignVolunteer(s, "s-1", "v-2", owner)).toThrow(
      "Missing Registration",
    );
  });
  it("revalidates every recommendation and never partially applies an invalid proposal", () => {
    const s = createDemo(owner);
    cancelAssignment(s, "a-1", "Test", owner);
    const p = generateProposal(s, owner);
    p.recommendations.push({ shiftId: "s-1", volunteerId: "v-2", reasons: [] });
    const before = structuredClone(s.assignments);
    expect(() => decideProposal(s, p.id, "approved", owner)).toThrow();
    expect(s.assignments).toEqual(before);
    expect(p.status).toBe("pending");
  });
});

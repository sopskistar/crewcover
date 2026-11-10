/** UTC instants; all intervals are half-open [start, end). No inference here. */
export type Interval = { start: string; end: string };
export type Volunteer = {
  id: string;
  name: string;
  skills: string[];
  availability: Interval[];
  maxHours: number;
  unavailable: boolean;
};
export type Shift = Interval & {
  id: string;
  role: string;
  area: string;
  skill: string;
  required: number;
  priority: "critical" | "standard";
};
export type Assignment = {
  id: string;
  shiftId: string;
  volunteerId: string;
  status: "active" | "cancelled";
};
export type Cancellation = Interval & {
  id: string;
  volunteerId: string;
  assignmentId: string;
  reason: string;
};
export type Candidate = {
  volunteerId: string;
  name: string;
  hours: number;
  reasons: string[];
};
export type Recommendation = {
  shiftId: string;
  volunteerId: string;
  reasons: string[];
};
export type Proposal = {
  id: string;
  revision: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  recommendations: Recommendation[];
  unresolved: { shiftId: string; count: number }[];
  before: number;
  after: number;
};
export type Activity = {
  id: string;
  at: string;
  type: string;
  message: string;
  actor: string;
};
export type Decision = {
  id: string;
  proposalId: string;
  outcome: "approved" | "rejected";
  actor: string;
  at: string;
};
export type EventState = {
  id: string;
  name: string;
  venue: string;
  date: string;
  timeZone: string;
  revision: number;
  volunteers: Volunteer[];
  shifts: Shift[];
  assignments: Assignment[];
  cancellations: Cancellation[];
  proposals: Proposal[];
  decisions: Decision[];
  activity: Activity[];
};

export class SchedulingError extends Error {
  constructor(
    message: string,
    public code = "CONFLICT",
    public status = 409,
  ) {
    super(message);
  }
}
export const overlap = (a: Interval, b: Interval) =>
  Date.parse(a.start) < Date.parse(b.end) &&
  Date.parse(b.start) < Date.parse(a.end);
export const hours = (s: Interval) =>
  (Date.parse(s.end) - Date.parse(s.start)) / 3_600_000;
export function validInterval(s: Interval) {
  return (
    Number.isFinite(Date.parse(s.start)) &&
    Number.isFinite(Date.parse(s.end)) &&
    Date.parse(s.end) > Date.parse(s.start)
  );
}
export function activeAssignments(state: EventState) {
  return state.assignments.filter((a) => a.status === "active");
}
function shiftTiming(shift: Shift, timeZone: string) {
  const format = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    dateStyle: "medium",
    timeStyle: "short",
  });
  return {
    durationHours: hours(shift),
    timeZone,
    startLocal: format.format(new Date(shift.start)),
    endLocal: format.format(new Date(shift.end)),
  };
}
export function coverage(state: EventState) {
  const active = activeAssignments(state);
  const shifts = state.shifts.map((s) => {
    const assigned = active.filter((a) => a.shiftId === s.id).length;
    const gap = Math.max(0, s.required - assigned);
    return {
      ...s,
      assigned,
      gap,
      uncoveredPositions: gap,
      ...shiftTiming(s, state.timeZone),
    };
  });
  const required = shifts.reduce((sum, s) => sum + s.required, 0);
  const covered = shifts.reduce(
    (sum, s) => sum + Math.min(s.assigned, s.required),
    0,
  );
  return {
    unit: "volunteer positions" as const,
    required,
    covered,
    gaps: required - covered,
    percentage: required ? Math.round((covered / required) * 100) : 100,
    shifts,
  };
}
export function assignedHours(state: EventState, volunteerId: string) {
  return activeAssignments(state)
    .filter((a) => a.volunteerId === volunteerId)
    .reduce(
      (sum, a) => sum + hours(state.shifts.find((s) => s.id === a.shiftId)!),
      0,
    );
}
export function exclusionReasons(
  state: EventState,
  volunteer: Volunteer,
  shift: Shift,
): string[] {
  const reasons: string[] = [];
  if (
    volunteer.unavailable ||
    state.cancellations.some(
      (c) => c.volunteerId === volunteer.id && overlap(c, shift),
    )
  )
    reasons.push("Unavailable or cancelled for this time");
  if (!volunteer.skills.includes(shift.skill))
    reasons.push(`Missing ${shift.skill} qualification`);
  if (
    !volunteer.availability.some(
      (a) =>
        Date.parse(a.start) <= Date.parse(shift.start) &&
        Date.parse(a.end) >= Date.parse(shift.end),
    )
  )
    reasons.push("Not available for the full shift");
  if (
    activeAssignments(state).some(
      (a) =>
        a.volunteerId === volunteer.id &&
        overlap(state.shifts.find((s) => s.id === a.shiftId)!, shift),
    )
  )
    reasons.push("Overlapping assignment");
  if (
    assignedHours(state, volunteer.id) + hours(shift) >
    volunteer.maxHours + 1e-8
  )
    reasons.push("Would exceed working-hour limit");
  return reasons;
}
/** Shared preview for manual vacancy fills. The server revalidates on write. */
export function assignmentIssues(
  state: EventState,
  shiftId: string,
  volunteerId: string,
): string[] {
  const shift = state.shifts.find((s) => s.id === shiftId);
  const volunteer = state.volunteers.find((v) => v.id === volunteerId);
  if (!shift || !volunteer) return ["Shift or volunteer not found"];
  if (
    activeAssignments(state).filter((a) => a.shiftId === shiftId).length >=
    shift.required
  )
    return ["This shift is already fully covered"];
  return exclusionReasons(state, volunteer, shift);
}
export function candidates(state: EventState, shiftId: string) {
  const shift = state.shifts.find((s) => s.id === shiftId);
  if (!shift) throw new SchedulingError("Shift not found.", "NOT_FOUND", 404);
  const eligible: Candidate[] = [],
    excluded: { volunteerId: string; name: string; reasons: string[] }[] = [];
  for (const v of state.volunteers) {
    const reasons = exclusionReasons(state, v, shift);
    if (reasons.length)
      excluded.push({ volunteerId: v.id, name: v.name, reasons });
    else
      eligible.push({
        volunteerId: v.id,
        name: v.name,
        hours: assignedHours(state, v.id),
        reasons: [
          `Qualified in ${shift.skill}`,
          "Available for the full shift",
          "No overlapping assignments",
          `${assignedHours(state, v.id) + hours(shift)} of ${v.maxHours} hour limit after assignment`,
          "Ranked by fewer assigned hours, then stable volunteer id",
        ],
      });
  }
  eligible.sort(
    (a, b) => a.hours - b.hours || a.volunteerId.localeCompare(b.volunteerId),
  );
  return {
    shift: { ...shift, ...shiftTiming(shift, state.timeZone) },
    eligible,
    excluded,
  };
}
export function record(
  state: EventState,
  type: string,
  message: string,
  actor: string,
) {
  state.activity.push({
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    type,
    message,
    actor,
  });
}
export function cancelAssignment(
  state: EventState,
  id: string,
  reason: string,
  actor: string,
) {
  const a = state.assignments.find((a) => a.id === id);
  if (!a) throw new SchedulingError("Assignment not found.", "NOT_FOUND", 404);
  if (a.status !== "active")
    throw new SchedulingError(
      "This assignment is already cancelled.",
      "ALREADY_CANCELLED",
    );
  const shift = state.shifts.find((s) => s.id === a.shiftId)!;
  a.status = "cancelled";
  state.cancellations.push({
    id: crypto.randomUUID(),
    volunteerId: a.volunteerId,
    assignmentId: a.id,
    reason,
    start: shift.start,
    end: shift.end,
  });
  state.revision++;
  record(
    state,
    "cancellation",
    `${state.volunteers.find((v) => v.id === a.volunteerId)!.name} cancelled ${shift.role}. ${reason}`,
    actor,
  );
  return a;
}
export function assignVolunteer(
  state: EventState,
  shiftId: string,
  volunteerId: string,
  actor: string,
) {
  const shift = state.shifts.find((s) => s.id === shiftId),
    volunteer = state.volunteers.find((v) => v.id === volunteerId);
  if (!shift || !volunteer)
    throw new SchedulingError(
      "Shift or volunteer not found.",
      "NOT_FOUND",
      404,
    );
  if (
    activeAssignments(state).filter((a) => a.shiftId === shiftId).length >=
    shift.required
  )
    throw new SchedulingError(
      "This shift is already fully covered.",
      "SHIFT_FULL",
    );
  const reasons = exclusionReasons(state, volunteer, shift);
  if (reasons.length)
    throw new SchedulingError(reasons.join("; "), "INELIGIBLE");
  const assignment: Assignment = {
    id: crypto.randomUUID(),
    shiftId,
    volunteerId,
    status: "active",
  };
  state.assignments.push(assignment);
  state.revision++;
  record(
    state,
    "assignment",
    `${volunteer.name} assigned to ${shift.role}.`,
    actor,
  );
  return assignment;
}
export function generateProposal(state: EventState, actor: string): Proposal {
  const existing = state.proposals.find(
    (p) => p.status === "pending" && p.revision === state.revision,
  );
  if (existing) return existing;
  const working = structuredClone(state),
    before = coverage(state).percentage;
  const recommendations: Recommendation[] = [],
    unresolved: Proposal["unresolved"] = [];
  const gaps = coverage(state)
    .shifts.filter((s) => s.gap > 0)
    .sort(
      (a, b) =>
        (a.priority === "critical" ? 0 : 1) -
          (b.priority === "critical" ? 0 : 1) ||
        a.start.localeCompare(b.start) ||
        a.id.localeCompare(b.id),
    );
  for (const shift of gaps) {
    let missing = 0;
    for (let i = 0; i < shift.gap; i++) {
      const best = candidates(working, shift.id).eligible[0];
      if (!best) {
        missing++;
        continue;
      }
      recommendations.push({
        shiftId: shift.id,
        volunteerId: best.volunteerId,
        reasons: best.reasons,
      });
      working.assignments.push({
        id: crypto.randomUUID(),
        shiftId: shift.id,
        volunteerId: best.volunteerId,
        status: "active",
      });
    }
    if (missing) unresolved.push({ shiftId: shift.id, count: missing });
  }
  const proposal: Proposal = {
    id: crypto.randomUUID(),
    revision: state.revision,
    status: "pending",
    createdAt: new Date().toISOString(),
    recommendations,
    unresolved,
    before,
    after: coverage(working).percentage,
  };
  state.proposals.push(proposal);
  record(
    state,
    "proposal",
    `Repair proposed: ${recommendations.length} replacement${recommendations.length === 1 ? "" : "s"}, ${unresolved.reduce((n, g) => n + g.count, 0)} unresolved. Awaiting organizer approval.`,
    actor,
  );
  return proposal;
}
export function decideProposal(
  state: EventState,
  proposalId: string,
  outcome: "approved" | "rejected",
  actor: string,
) {
  const proposal = state.proposals.find((p) => p.id === proposalId);
  if (!proposal)
    throw new SchedulingError("Proposal not found.", "NOT_FOUND", 404);
  if (proposal.status !== "pending")
    throw new SchedulingError(
      "This proposal has already been decided.",
      "ALREADY_DECIDED",
    );
  if (outcome === "approved") {
    if (proposal.revision !== state.revision)
      throw new SchedulingError(
        "The schedule changed. Generate a fresh proposal before approving.",
        "STALE_PROPOSAL",
      );
    // Validate on a copy first so a later invalid recommendation never leaves partial changes.
    const working = structuredClone(state);
    for (const r of proposal.recommendations)
      assignVolunteer(working, r.shiftId, r.volunteerId, actor);
    state.assignments = working.assignments;
    state.revision = working.revision;
    state.activity = working.activity;
  }
  proposal.status = outcome;
  state.decisions.push({
    id: crypto.randomUUID(),
    proposalId,
    outcome,
    actor,
    at: new Date().toISOString(),
  });
  record(
    state,
    outcome,
    `Repair ${outcome}. Coverage is ${coverage(state).percentage}%.`,
    actor,
  );
  return proposal;
}

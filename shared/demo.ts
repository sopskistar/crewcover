import { type EventState, record } from "./scheduling";

export function createDemo(
  owner: string,
  id: string = crypto.randomUUID(),
): EventState {
  const start = "2026-11-14T08:00:00.000Z",
    end = "2026-11-14T16:00:00.000Z";
  const names = [
    "Ada Okafor",
    "Noah Patel",
    "Mia Chen",
    "Leo Mensah",
    "Zara Ali",
    "Eli Brooks",
    "Nia James",
    "Owen Kim",
    "Ivy Santos",
    "Kai Reed",
    "Ava Bello",
    "Liam Cruz",
    "Sofia Park",
    "Amir Cole",
    "Isla Young",
    "Jude Silva",
    "Luna Adeyemi",
    "Ezra Morgan",
    "Aria Nwosu",
    "Theo Martin",
  ];
  const skills = [
    "Registration",
    "Safety",
    "Technical",
    "Guest services",
    "Logistics",
  ];
  const state: EventState = {
    id,
    name: "Gather 2026",
    venue: "Lagos Convention Centre · Demo event",
    date: "2026-11-14",
    timeZone: "Africa/Lagos",
    revision: 1,
    volunteers: [],
    shifts: [],
    assignments: [],
    cancellations: [],
    proposals: [],
    decisions: [],
    activity: [],
  };
  state.volunteers = names.map((name, i) => ({
    id: `v-${i + 1}`,
    name,
    skills: [skills[i % 5]!, ...(i >= 10 ? [skills[(i + 1) % 5]!] : [])],
    availability: [
      {
        start: i === 17 ? "2026-11-14T12:00:00.000Z" : start,
        end: i === 8 ? "2026-11-14T12:00:00.000Z" : end,
      },
    ],
    maxHours: i === 19 ? 4 : 8,
    unavailable: false,
  }));
  const roles = [
    "Welcome desk",
    "Safety & access",
    "Stage & technical",
    "Guest assistance",
    "Event logistics",
  ];
  const areas = [
    "Main entrance",
    "North & south gates",
    "Auditorium",
    "Conference floor",
    "Backstage",
  ];
  for (let slot = 0; slot < 2; slot++)
    for (let role = 0; role < 5; role++) {
      const shift = {
        id: `s-${slot * 5 + role + 1}`,
        role: roles[role]!,
        area: areas[role]!,
        skill: skills[role]!,
        start: slot === 0 ? start : "2026-11-14T12:00:00.000Z",
        end: slot === 0 ? "2026-11-14T12:00:00.000Z" : end,
        required: 2,
        priority:
          role === 1 || role === 2
            ? ("critical" as const)
            : ("standard" as const),
      };
      state.shifts.push(shift);
      for (let position = 0; position < 2; position++)
        state.assignments.push({
          id: `a-${slot * 10 + role * 2 + position + 1}`,
          shiftId: shift.id,
          volunteerId: `v-${slot * 10 + role + position * 5 + 1}`,
          status: "active",
        });
    }
  record(
    state,
    "seed",
    "Fictional conference initialized: 20 volunteers and 20 staffed positions.",
    owner,
  );
  return state;
}

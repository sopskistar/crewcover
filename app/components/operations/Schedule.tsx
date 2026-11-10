import { useActionMutation } from "@agent-native/core/client/hooks";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  pointerWithin,
  rectIntersection,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  IconGripVertical,
  IconPlus,
  IconChevronRight,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

import {
  assignmentIssues,
  assignedHours,
  candidates,
  type EventState,
  type Assignment,
  type Shift,
  type Volunteer,
} from "../../../shared/scheduling";
import { useDialogFocusReturn } from "./use-dialog-focus-return";

const time = (iso: string, zone: string) =>
  new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
const initials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
const collision: CollisionDetection = (args) =>
  args.pointerCoordinates ? pointerWithin(args) : rectIntersection(args);

function VolunteerHandle({
  volunteer: v,
  state,
}: {
  volunteer: Volunteer;
  state: EventState;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, isDragging } =
    useDraggable({
      id: v.id,
    });
  return (
    <div
      ref={setNodeRef}
      className={`cc-drag-person ${isDragging ? "is-dragging" : ""}`}
    >
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className="cc-drag-handle"
        aria-label={`Drag ${v.name} to a vacancy`}
        data-testid={`drag-${v.id}`}
      >
        <IconGripVertical size={17} aria-hidden="true" />
      </button>
      <span>
        <strong>{v.name}</strong>
        <small>
          {v.skills.join(", ")} · {assignedHours(state, v.id)} / {v.maxHours} h
        </small>
      </span>
    </div>
  );
}
function ShiftCell({
  state: s,
  shift,
  active,
  onCancel,
  onAssign,
}: {
  state: EventState;
  shift: Shift;
  active: Volunteer | undefined;
  onCancel: (a: Assignment) => void;
  onAssign: (s: Shift) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: shift.id });
  const assigned = s.assignments.filter(
    (a) => a.shiftId === shift.id && a.status === "active",
  );
  const gap = Math.max(0, shift.required - assigned.length);
  const issues = active ? assignmentIssues(s, shift.id, active.id) : [];
  return (
    <div
      ref={setNodeRef}
      role="cell"
      className={`cc-shift ${gap ? "has-gap" : ""} ${active ? (issues.length ? "cc-drop-forbidden" : "cc-drop-permitted") : ""} ${isOver && active ? "cc-drop-over" : ""}`}
      data-testid={`shift-${shift.id}`}
    >
      <span className="cc-mobile-time">
        {time(shift.start, s.timeZone)} to {time(shift.end, s.timeZone)}
      </span>
      {assigned.map((a) => {
        const v = s.volunteers.find((v) => v.id === a.volunteerId)!;
        return (
          <div className="cc-assignee" key={a.id}>
            <span className="cc-avatar">{initials(v.name)}</span>
            <span>{v.name}</span>
            <button
              type="button"
              aria-label={`Cancel ${v.name} on ${shift.role}`}
              title="Cancel assignment"
              onClick={() => onCancel(a)}
            >
              <IconX size={14} />
            </button>
          </div>
        );
      })}
      {gap > 0 && (
        <button className="cc-vacancy" onClick={() => onAssign(shift)}>
          <IconPlus size={15} />
          {gap} uncovered
          <IconChevronRight size={14} />
        </button>
      )}
      {active && (
        <span
          className={`cc-drop-hint ${issues.length ? "is-forbidden" : ""}`}
          title={issues.join("; ")}
        >
          {issues.length
            ? `${issues[0]}${issues.length > 1 ? ` (+${issues.length - 1} more checks)` : ""}`
            : "Eligible — drop to review"}
        </span>
      )}
    </div>
  );
}
export default function Schedule({
  state: s,
  onCancel,
  onAssign,
  enableDrag = false,
}: {
  state: EventState;
  onCancel: (a: Assignment) => void;
  onAssign: (s: Shift) => void;
  enableDrag?: boolean;
}) {
  const dialogFocus = useDialogFocusReturn();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<{
    shiftId: string;
    volunteerId: string;
  } | null>(null);
  const [feedback, setFeedback] = useState("");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor),
  );
  const assign = useActionMutation("assign-volunteer", {
    onError: (error) => {
      setFeedback(error.message);
      toast.error(error.message);
    },
  });
  const active = s.volunteers.find((v) => v.id === activeId);
  const slots = [...new Set(s.shifts.map((x) => x.start))].sort();
  const roles = [...new Set(s.shifts.map((x) => x.role))];
  const selectedShift = s.shifts.find((x) => x.id === draft?.shiftId);
  const selectedVolunteer = s.volunteers.find(
    (x) => x.id === draft?.volunteerId,
  );
  const draftIssues = draft
    ? assignmentIssues(s, draft.shiftId, draft.volunteerId)
    : [];
  const reasons =
    selectedShift && selectedVolunteer
      ? (candidates(s, selectedShift.id).eligible.find(
          (v) => v.volunteerId === selectedVolunteer.id,
        )?.reasons ?? [])
      : [];
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collision}
      onDragStart={(e) => {
        setActiveId(String(e.active.id));
        setFeedback(
          "Drop on an eligible vacancy to review. No assignment is saved until you approve.",
        );
      }}
      onDragCancel={() => {
        setActiveId(null);
        setFeedback("Drag cancelled. Schedule unchanged.");
      }}
      onDragEnd={(e) => {
        setActiveId(null);
        if (!e.over) {
          setFeedback("No shift selected. Schedule unchanged.");
          return;
        }
        const shiftId = String(e.over.id),
          volunteerId = String(e.active.id);
        const issues = assignmentIssues(s, shiftId, volunteerId);
        if (issues.length) {
          setFeedback(`Cannot assign: ${issues.join("; ")}.`);
          toast.error(`Cannot assign: ${issues.join("; ")}`);
          return;
        }
        setDraft({ shiftId, volunteerId });
      }}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "To pick up a volunteer, press Space. Use arrow keys to move to a shift. Press Space to review a drop, or Escape to cancel. You can also choose any uncovered position to assign without dragging.",
        },
      }}
    >
      {enableDrag && (
        <details className="cc-drag-tray" open>
          <summary>Fill a vacancy with your crew</summary>
          <p>
            Drag a volunteer to an uncovered shift, review the checks, then
            approve. Or select an uncovered position to choose a replacement
            without dragging.
          </p>
          <Input
            aria-label="Find volunteer to assign"
            placeholder="Find a volunteer or skill…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="cc-drag-people">
            {s.volunteers
              .filter((v) =>
                `${v.name} ${v.skills.join(" ")}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )
              .map((v) => (
                <VolunteerHandle key={v.id} volunteer={v} state={s} />
              ))}
          </div>
          <p className="cc-drag-feedback" role="status" aria-live="polite">
            {feedback ||
              "Green targets are eligible; forbidden targets explain their constraints when dragging. Server validation runs again on approval."}
          </p>
        </details>
      )}
      <div
        className="cc-ledger"
        role="table"
        aria-label="Volunteer staffing schedule"
      >
        <div className="cc-ledger-head" role="row">
          <div role="columnheader">Role / location</div>
          {slots.map((slot) => (
            <div role="columnheader" key={slot}>
              {time(slot, s.timeZone)}
              <span>
                {" "}
                to{" "}
                {time(s.shifts.find((x) => x.start === slot)!.end, s.timeZone)}
              </span>
            </div>
          ))}
        </div>
        {roles.map((role) => (
          <div className="cc-ledger-row" role="row" key={role}>
            <div className="cc-role" role="rowheader">
              <strong>{role}</strong>
              <span>{s.shifts.find((x) => x.role === role)!.area}</span>
              {s.shifts.find((x) => x.role === role)!.priority ===
                "critical" && <small>Critical role</small>}
            </div>
            {slots.map((slot) => (
              <ShiftCell
                key={slot}
                state={s}
                shift={
                  s.shifts.find((x) => x.role === role && x.start === slot)!
                }
                active={active}
                onCancel={onCancel}
                onAssign={onAssign}
              />
            ))}
          </div>
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {active ? (
          <div className="cc-drag-preview">
            <IconGripVertical size={18} />
            <strong>{active.name}</strong>
            <span>Drop to review</span>
          </div>
        ) : null}
      </DragOverlay>
      <AlertDialog
        open={!!draft}
        onOpenChange={(open) => {
          if (!open && !assign.isPending) setDraft(null);
        }}
      >
        <AlertDialogContent data-crewcover-review="" {...dialogFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>Review manual assignment</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedVolunteer?.name} → {selectedShift?.role},{" "}
              {selectedShift && time(selectedShift.start, s.timeZone)} to{" "}
              {selectedShift && time(selectedShift.end, s.timeZone)},{" "}
              {s.timeZone}. This fills one vacancy; existing assignments stay in
              place.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {draftIssues.length ? (
            <p role="alert">
              The schedule changed: {draftIssues.join("; ")}. Close and choose
              another replacement.
            </p>
          ) : (
            <ul className="cc-assignment-checks">
              {reasons.map((reason) => (
                <li key={reason}>
                  <IconCheck size={15} />
                  {reason}
                </li>
              ))}
            </ul>
          )}
          <p className="cc-assignment-note">
            Your approval saves the assignment after a fresh server check and
            records it in Activity.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={assign.isPending}>
              Keep schedule
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={assign.isPending || !!draftIssues.length}
              onClick={(e) => {
                e.preventDefault();
                if (!draft) return;
                assign.mutate(
                  { eventId: s.id, ...draft },
                  {
                    onSuccess: () => {
                      setDraft(null);
                      setFeedback(
                        "Assignment approved and saved. Coverage updated.",
                      );
                      toast.success("Assignment approved and saved.");
                    },
                  },
                );
              }}
            >
              {assign.isPending ? "Saving assignment…" : "Approve assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DndContext>
  );
}

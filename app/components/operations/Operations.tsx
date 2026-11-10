import {
  useActionMutation,
  useActionQuery,
} from "@agent-native/core/client/hooks";
import { focusAgentChat } from "@agent-native/toolkit/app/chat";
import {
  IconArrowRight,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconMapPin,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
  IconX,
  IconAlertTriangle,
} from "@tabler/icons-react";
import { useState, useEffect, useRef, type FormEvent } from "react";
import { useSearchParams } from "react-router";
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
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  assignedHours,
  type EventState,
  type Assignment,
  type Volunteer,
  type Shift,
} from "../../../shared/scheduling";
import { CrewCoverMark } from "../CrewCoverMark";
import Schedule from "./Schedule";
import { useDialogFocusReturn } from "./use-dialog-focus-return";

const views = [
  ["overview", "Overview"],
  ["schedule", "Schedule"],
  ["volunteers", "Volunteers"],
  ["repairs", "Repair Center"],
  ["activity", "Activity"],
] as const;
const errorToast = (error: Error) => toast.error(error.message);
const initials = (name: string) =>
  name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
function time(iso: string, zone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}
function eventInput(iso: string, zone: string) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
function utcInput(value: string, zone: string) {
  const guess = new Date(value + "Z");
  const shown = eventInput(guess.toISOString(), zone);
  return new Date(
    guess.getTime() - (Date.parse(shown + "Z") - guess.getTime()),
  ).toISOString();
}

export default function Operations() {
  const tabsRef = useRef<HTMLElement>(null);
  const dialogFocus = useDialogFocusReturn();
  const [params, setParams] = useSearchParams(),
    view = params.get("view") ?? "overview";
  const list = useActionQuery("list-events", {});
  const eventId = list.data?.events[0]?.id;
  useEffect(() => {
    if (eventId && params.get("eventId") !== eventId)
      setParams(
        (current) => {
          current.set("eventId", eventId);
          return current;
        },
        { replace: true },
      );
  }, [eventId, params, setParams]);
  const event = useActionQuery(
    "get-event-coverage",
    { eventId: eventId ?? "" },
    { enabled: !!eventId, staleTime: 0, refetchOnMount: "always" },
  );
  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const revealActiveTab = () =>
      tabs.querySelector<HTMLElement>('[aria-current="page"]')?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
    revealActiveTab();
    const observer = new ResizeObserver(revealActiveTab);
    observer.observe(tabs);
    return () => observer.disconnect();
  }, [view, event.data?.state.id]);
  const initialize = useActionMutation("initialize-demo", {
    onError: errorToast,
  });
  const [cancel, setCancel] = useState<Assignment | null>(null),
    [reset, setReset] = useState(false),
    [assign, setAssign] = useState<Shift | null>(null),
    [editing, setEditing] = useState<Volunteer | "new" | null>(null);
  const cancelAction = useActionMutation("cancel-assignment", {
    onError: errorToast,
  });
  const repair = useActionMutation("generate-repair-proposal", {
    onError: errorToast,
  });
  const [guide, setGuide] = useState(() => {
    try {
      return localStorage.getItem("crewcover.guide") !== "dismissed";
    } catch {
      return true;
    }
  });
  const navigate = (next: string) =>
    setParams((p) => {
      p.set("view", next);
      if (eventId) p.set("eventId", eventId);
      return p;
    });
  function askAgent() {
    focusAgentChat();
  }
  if (list.isLoading)
    return (
      <div className="cc-workspace" aria-label="Loading event">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="mt-8 h-32 w-full" />
        <Skeleton className="mt-8 h-96 w-full" />
      </div>
    );
  if (list.error || event.error)
    return (
      <div className="cc-empty" role="alert">
        <IconAlertTriangle size={32} />
        <h1>Unable to load your event</h1>
        <p>{(list.error ?? event.error)?.message}</p>
        <Button
          onClick={() => {
            void list.refetch();
            void event.refetch();
          }}
        >
          Try again
        </Button>
      </div>
    );
  if (!eventId)
    return (
      <div className="cc-empty">
        <CrewCoverMark className="cc-welcome-mark" />
        <h1>A ready crew starts here.</h1>
        <p>
          Open a fictional conference with 20 volunteers, real scheduling
          constraints, and a scenario you can reset.
        </p>
        <Button
          disabled={initialize.isPending}
          onClick={() => initialize.mutate({ reset: false, confirmation: "" })}
        >
          {initialize.isPending
            ? "Preparing conference…"
            : "Open demo conference"}
          <IconArrowRight size={17} />
        </Button>
        <small>Fictional data. Your own private workspace.</small>
      </div>
    );
  const data = event.data;
  if (!data)
    return (
      <div className="cc-workspace">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="mt-8 h-96 w-full" />
      </div>
    );
  const { state: s, coverage: c } = data;
  const pending = s.proposals
    .filter((p) => p.status === "pending" && p.revision === s.revision)
    .slice(-1)[0];
  const cancellations = s.cancellations.length;
  const cancelledVolunteer = cancel
    ? s.volunteers.find((v) => v.id === cancel.volunteerId)
    : undefined;
  return (
    <div className="cc-workspace">
      <header className="cc-event-header">
        <div>
          <div className="cc-title-line">
            <h1>{s.name}</h1>
            <span className="cc-demo-label">Demo event</span>
          </div>
          <div className="cc-event-details">
            <span>
              <IconMapPin size={15} />
              {s.venue.replace(" · Demo event", "")}
            </span>
            <span>
              <IconClock size={15} />
              14 Nov 2026, {s.timeZone}
            </span>
          </div>
        </div>
        <div className="cc-header-actions">
          <Button
            variant="outline"
            onClick={() => setReset(true)}
            aria-label="Reset demo"
          >
            <IconRefresh size={16} />
            <span className="cc-hide-phone">Reset demo</span>
          </Button>
          <Button className="cc-agent-button" onClick={askAgent}>
            <IconSparkles size={17} />
            Ask agent
          </Button>
        </div>
      </header>
      <nav ref={tabsRef} className="cc-tabs" aria-label="Event views">
        {views.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-current={view === id ? "page" : undefined}
            className={view === id ? "is-active" : ""}
            onClick={() => navigate(id)}
          >
            {label}
            {id === "repairs" && c.gaps > 0 ? (
              <span className="cc-tab-count">{c.gaps}</span>
            ) : null}
          </button>
        ))}
      </nav>
      {guide && view === "overview" ? (
        <aside className="cc-guide">
          <div>
            <strong>Try the recovery workflow</strong>
            <p>
              Cancel a volunteer in the schedule, find a qualified repair, then
              approve the changes.
            </p>
          </div>
          <button
            aria-label="Dismiss first-use guide"
            onClick={() => {
              setGuide(false);
              try {
                localStorage.setItem("crewcover.guide", "dismissed");
              } catch {}
            }}
          >
            <IconX size={18} />
          </button>
        </aside>
      ) : null}
      <section
        className={`cc-coverage ${c.gaps ? "has-gaps" : ""}`}
        aria-label="Event coverage"
      >
        <div className="cc-coverage-number">
          <strong data-testid="coverage-percentage" aria-live="polite">
            {c.percentage}
            <span>%</span>
          </strong>
          <span>Staffing coverage</span>
        </div>
        <div className="cc-coverage-track">
          <div className="cc-coverage-label">
            <span>
              {c.covered} of {c.required} positions covered
            </span>
            <strong className={c.gaps ? "cc-danger-text" : "cc-good-text"}>
              {c.gaps ? `${c.gaps} uncovered` : "All roles covered"}
              {c.gaps ? (
                <IconAlertTriangle size={15} />
              ) : (
                <IconCheck size={15} />
              )}
            </strong>
          </div>
          <div
            className="cc-position-track"
            role="meter"
            aria-label="Staffed positions"
            aria-valuemin={0}
            aria-valuemax={c.required}
            aria-valuenow={c.covered}
          >
            {c.shifts.flatMap((shift) =>
              Array.from({ length: shift.required }, (_, i) => (
                <span
                  key={`${shift.id}-${i}`}
                  className={i < shift.assigned ? "is-covered" : "is-uncovered"}
                  title={`${shift.role}: ${i < shift.assigned ? "covered" : "uncovered"}`}
                />
              )),
            )}
          </div>
          <div className="cc-coverage-note">
            <span>{s.volunteers.length} volunteers</span>
            <span>{s.shifts.length} shifts</span>
            <span>
              {cancellations} cancellation{cancellations === 1 ? "" : "s"}
            </span>
          </div>
        </div>
        <div className="cc-coverage-action">
          {c.gaps ? (
            <Button
              className="cc-primary"
              onClick={() => {
                navigate("repairs");
                if (!pending) repair.mutate({ eventId: s.id });
              }}
              disabled={repair.isPending}
            >
              {repair.isPending
                ? "Finding replacements…"
                : pending
                  ? "Review repair"
                  : "Find a repair"}
              <IconArrowRight size={16} />
            </Button>
          ) : (
            <span className="cc-healthy">
              <IconShieldCheck size={25} />
              Ready for the event
            </span>
          )}
        </div>
      </section>
      {view === "overview" || view === "schedule" ? (
        <div
          className={view === "overview" ? "cc-main-grid" : "cc-full-ledger"}
        >
          <section className="cc-ledger-region">
            <div className="cc-section-heading">
              <div>
                <h2>Staffing schedule</h2>
                <p>Assigned crew and open positions, by role.</p>
              </div>
              {view === "overview" ? (
                <button
                  className="cc-text-button"
                  onClick={() => navigate("schedule")}
                >
                  Full schedule
                  <IconChevronRight size={16} />
                </button>
              ) : null}
            </div>
            <Schedule
              state={s}
              onCancel={setCancel}
              onAssign={setAssign}
              enableDrag={view === "schedule"}
            />
            <div className="cc-ledger-legend">
              <span>
                <i className="cc-dot good" />
                Covered
              </span>
              <span>
                <i className="cc-dot danger" />
                Uncovered
              </span>
              <span>Times in Lagos (WAT)</span>
            </div>
          </section>
          {view === "overview" ? (
            <aside className="cc-side-stack">
              <section className="cc-repair-queue">
                <h2>
                  {c.gaps
                    ? `${c.gaps} position${c.gaps === 1 ? " needs" : "s need"} a hand.`
                    : "Your crew is in place."}
                </h2>
                <p>
                  {c.gaps
                    ? "Match each vacancy with an available, qualified volunteer. You review every change."
                    : "If plans change, your schedule and the agent work from the same live data."}
                </p>
                {c.gaps ? (
                  <Button
                    onClick={() => {
                      navigate("repairs");
                      if (!pending) repair.mutate({ eventId: s.id });
                    }}
                    disabled={repair.isPending}
                  >
                    {pending
                      ? "Review pending repair"
                      : repair.isPending
                        ? "Preparing…"
                        : "Find qualified replacements"}
                    <IconArrowRight size={16} />
                  </Button>
                ) : (
                  <div className="cc-queue-ready">
                    <IconCheck size={16} />
                    No repairs awaiting approval
                  </div>
                )}
                <button className="cc-queue-agent" onClick={askAgent}>
                  <IconSparkles size={16} />
                  Ask scheduling agent
                  <IconChevronRight size={15} />
                </button>
              </section>
              <section className="cc-recent">
                <div className="cc-section-heading">
                  <h2>Recent activity</h2>
                  <button
                    className="cc-text-button"
                    onClick={() => navigate("activity")}
                  >
                    View all
                  </button>
                </div>
                <ActivityList state={s} compact />
              </section>
            </aside>
          ) : null}
        </div>
      ) : null}
      {view === "repairs" ? (
        <RepairCenter
          state={s}
          busy={repair.isPending}
          onGenerate={() => repair.mutate({ eventId: s.id })}
          onAssign={setAssign}
          onAsk={askAgent}
        />
      ) : null}
      {view === "volunteers" ? (
        <VolunteerDirectory state={s} onEdit={setEditing} />
      ) : null}
      {view === "activity" ? (
        <section className="cc-activity-page">
          <div className="cc-section-heading">
            <div>
              <h2>Event history</h2>
              <p>Recorded changes to this event, newest first.</p>
            </div>
          </div>
          <ActivityList state={s} />
        </section>
      ) : null}
      <footer className="cc-footer">
        <span>
          <CrewCoverMark />
          CrewCover, human-approved scheduling
        </span>
        <span>Fictional conference, persisted application data</span>
      </footer>
      <AlertDialog
        open={!!cancel}
        onOpenChange={(open) => {
          if (!open) setCancel(null);
        }}
      >
        <AlertDialogContent {...dialogFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Cancel {cancelledVolunteer?.name}’s assignment?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This removes the volunteer from this shift and marks them
              unavailable for its duration. Coverage updates immediately after
              saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep assignment</AlertDialogCancel>
            <AlertDialogAction
              disabled={cancelAction.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (cancel)
                  cancelAction.mutate(
                    {
                      eventId: s.id,
                      assignmentId: cancel.id,
                      reason: "Volunteer is unable to attend this shift.",
                    },
                    {
                      onSuccess: () => {
                        setCancel(null);
                        toast.success(
                          "Assignment cancelled. Coverage updated.",
                        );
                      },
                    },
                  );
              }}
            >
              {cancelAction.isPending ? "Cancelling…" : "Cancel assignment"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={reset} onOpenChange={setReset}>
        <AlertDialogContent {...dialogFocus}>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your demo conference?</AlertDialogTitle>
            <AlertDialogDescription>
              This resets your fictional conference to 100% coverage and clears
              its proposals and history. Other organizers’ workspaces and your
              account are preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep current schedule</AlertDialogCancel>
            <AlertDialogAction
              disabled={initialize.isPending}
              onClick={(e) => {
                e.preventDefault();
                initialize.mutate(
                  { reset: true, confirmation: "RESET DEMO" },
                  {
                    onSuccess: () => {
                      setReset(false);
                      toast.success("Demo reset to full coverage.");
                    },
                  },
                );
              }}
            >
              {initialize.isPending ? "Resetting…" : "Reset conference"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {assign ? (
        <AssignmentPicker
          state={s}
          shift={assign}
          onClose={() => setAssign(null)}
        />
      ) : null}
      {editing ? (
        <VolunteerEditor
          state={s}
          volunteer={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function RepairCenter({
  state: s,
  busy,
  onGenerate,
  onAssign,
  onAsk,
}: {
  state: EventState;
  busy: boolean;
  onGenerate: () => void;
  onAssign: (s: Shift) => void;
  onAsk: () => void;
}) {
  const dialogFocus = useDialogFocusReturn();
  const approve = useActionMutation("approve-repair-proposal", {
      onError: errorToast,
    }),
    reject = useActionMutation("reject-repair-proposal", {
      onError: errorToast,
    });
  const [confirm, setConfirm] = useState(false);
  const pending = s.proposals
      .filter((p) => p.status === "pending")
      .slice(-1)[0],
    stale = pending && pending.revision !== s.revision;
  const gaps = s.shifts.filter(
    (x) =>
      s.assignments.filter((a) => a.shiftId === x.id && a.status === "active")
        .length < x.required,
  );
  const latestApproved = s.proposals
    .filter((p) => p.status === "approved")
    .slice(-1)[0];
  const uncovered = gaps.reduce(
    (sum, shift) =>
      sum +
      Math.max(
        0,
        shift.required -
          s.assignments.filter(
            (a) => a.status === "active" && a.shiftId === shift.id,
          ).length,
      ),
    0,
  );
  return (
    <section className="cc-repairs">
      <div className="cc-section-heading">
        <div>
          <h2>Repair Center</h2>
          <p>Recommendations are proposals until you approve them.</p>
        </div>
        <Button variant="outline" onClick={onAsk}>
          <IconSparkles size={16} />
          Ask agent
        </Button>
      </div>
      <dl className="cc-recovery-facts" aria-label="Repair impact">
        <div>
          <dt>Uncovered positions</dt>
          <dd>{uncovered}</dd>
        </div>
        <div>
          <dt>Validated recommendations</dt>
          <dd>{pending && !stale ? pending.recommendations.length : 0}</dd>
        </div>
        <div>
          <dt>Awaiting approval</dt>
          <dd>{pending && !stale ? pending.recommendations.length : 0}</dd>
        </div>
        <div>
          <dt>Unresolved after proposed repair</dt>
          <dd>
            {pending && !stale
              ? pending.unresolved.reduce((n, g) => n + g.count, 0)
              : uncovered}
          </dd>
        </div>
      </dl>
      {latestApproved && (
        <div className="cc-recovery-receipt" role="status">
          <strong>
            {latestApproved.recommendations.length} position
            {latestApproved.recommendations.length === 1 ? "" : "s"} recovered
            by the latest approved repair
          </strong>
          <p>
            At approval: {latestApproved.before}% → {latestApproved.after}%.
            Current coverage reflects any later manual changes. See Activity for
            the recorded approval.
          </p>
        </div>
      )}
      {!pending || stale ? (
        <div className="cc-repair-start">
          <IconShieldCheck size={32} />
          <div>
            <h3>
              {gaps.length
                ? stale
                  ? "The schedule changed. Find a fresh repair."
                  : "Find the right people for the gaps."
                : "Every position is covered."}
            </h3>
            <p>
              {gaps.length
                ? "Availability, skills, overlaps and hour limits are checked for every recommendation."
                : "Cancel an assignment in the schedule to try the recovery workflow."}
            </p>
          </div>
          <Button disabled={busy || !gaps.length} onClick={onGenerate}>
            {busy ? "Checking candidates…" : "Generate repair proposal"}
            <IconArrowRight size={16} />
          </Button>
        </div>
      ) : (
        <>
          <div className="cc-proposal-summary">
            <div>
              <span className="cc-status pending">Awaiting your approval</span>
              <h3>
                {pending.recommendations.length} qualified replacement
                {pending.recommendations.length === 1 ? "" : "s"}
              </h3>
              <p>
                Proposed coverage{" "}
                <strong>
                  {pending.before}% <IconArrowRight size={15} /> {pending.after}
                  %
                </strong>
              </p>
            </div>
            <div className="cc-proposal-actions">
              <Button
                variant="outline"
                disabled={reject.isPending || approve.isPending}
                onClick={() =>
                  reject.mutate(
                    { eventId: s.id, proposalId: pending.id },
                    {
                      onSuccess: () =>
                        toast.success("Proposal rejected. Schedule unchanged."),
                    },
                  )
                }
              >
                Reject proposal
              </Button>
              <Button
                className="cc-primary"
                disabled={
                  !pending.recommendations.length ||
                  approve.isPending ||
                  reject.isPending
                }
                onClick={() => setConfirm(true)}
              >
                Review & approve
                <IconCheck size={16} />
              </Button>
            </div>
          </div>
          <div className="cc-recommendations">
            {pending.recommendations.map((r) => {
              const shift = s.shifts.find((x) => x.id === r.shiftId)!,
                v = s.volunteers.find((x) => x.id === r.volunteerId)!;
              return (
                <article
                  className="cc-recommendation"
                  key={`${r.shiftId}-${r.volunteerId}`}
                >
                  <div className="cc-recommendation-main">
                    <span className="cc-avatar large">{initials(v.name)}</span>
                    <div>
                      <h4>{v.name}</h4>
                      <p>
                        {shift.role}, {time(shift.start, s.timeZone)} to
                        {time(shift.end, s.timeZone)}
                      </p>
                    </div>
                    <span className="cc-status pending">Proposed</span>
                  </div>
                  <ul>
                    {r.reasons.map((reason) => (
                      <li key={reason}>
                        <IconCheck size={14} />
                        {reason}
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAssign(shift)}
                  >
                    Inspect eligible and excluded candidates
                  </Button>
                </article>
              );
            })}
          </div>
          {pending.unresolved.length ? (
            <div className="cc-unresolved" role="status">
              <IconAlertTriangle size={19} />
              <div>
                <strong>
                  {pending.unresolved.reduce((n, g) => n + g.count, 0)}{" "}
                  position(s) remain unresolved
                </strong>
                <p>
                  No eligible candidate satisfies all constraints. These
                  positions stay uncovered after approval.
                </p>
              </div>
            </div>
          ) : null}
          <AlertDialog open={confirm} onOpenChange={setConfirm}>
            <AlertDialogContent {...dialogFocus}>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Approve {pending.recommendations.length} replacement
                  {pending.recommendations.length === 1 ? "" : "s"}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  These assignments will be saved together after a fresh
                  constraint check. Coverage is expected to move from{" "}
                  {pending.before}% to {pending.after}%. Your approval is
                  recorded in event history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back to review</AlertDialogCancel>
                <AlertDialogAction
                  disabled={approve.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    approve.mutate(
                      { eventId: s.id, proposalId: pending.id },
                      {
                        onSuccess: () => {
                          setConfirm(false);
                          toast.success("Repair approved. Assignments saved.");
                        },
                      },
                    );
                  }}
                >
                  {approve.isPending
                    ? "Saving repair…"
                    : "Approve & apply repair"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
      {gaps.length ? (
        <details className="cc-gap-details">
          <summary>Inspect uncovered shifts and assign manually</summary>
          {gaps.map((shift) => (
            <div key={shift.id}>
              <span>
                {shift.role}, {time(shift.start, s.timeZone)}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAssign(shift)}
              >
                Choose replacement
              </Button>
            </div>
          ))}
        </details>
      ) : null}
      <details className="cc-faq">
        <summary>How are replacements chosen?</summary>
        <p>
          The engine checks qualifications, full-shift availability,
          cancellation records, overlaps and hour limits. It ranks eligible
          volunteers by assigned hours, then stable volunteer id. Proposed
          assignments are considered together so a volunteer cannot fill
          conflicting vacancies. AI can explain and request the same operations;
          it cannot bypass them.
        </p>
      </details>
    </section>
  );
}

function AssignmentPicker({
  state: s,
  shift,
  onClose,
}: {
  state: EventState;
  shift: Shift;
  onClose: () => void;
}) {
  const dialogFocus = useDialogFocusReturn();
  const query = useActionQuery("find-qualified-replacements", {
    eventId: s.id,
    shiftId: shift.id,
  });
  const assign = useActionMutation("assign-volunteer", { onError: errorToast });
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="cc-dialog" {...dialogFocus}>
        <DialogHeader>
          <DialogTitle>Assign a replacement</DialogTitle>
          <DialogDescription>
            {shift.role}, {time(shift.start, s.timeZone)} to
            {time(shift.end, s.timeZone)}, {s.timeZone}
          </DialogDescription>
        </DialogHeader>
        {query.isLoading ? (
          <Skeleton className="h-36 w-full" />
        ) : query.error ? (
          <p role="alert">{query.error.message}</p>
        ) : (
          <div className="cc-candidate-list">
            {query.data?.eligible.length ? (
              query.data.eligible.map((v) => (
                <div className="cc-candidate" key={v.volunteerId}>
                  <div>
                    <strong>{v.name}</strong>
                    <span className="cc-eligible-label">
                      Eligible candidate
                    </span>
                    <p>{v.reasons.join("; ")}</p>
                  </div>
                  <Button
                    disabled={assign.isPending}
                    onClick={() =>
                      assign.mutate(
                        {
                          eventId: s.id,
                          shiftId: shift.id,
                          volunteerId: v.volunteerId,
                        },
                        {
                          onSuccess: () => {
                            toast.success("Assignment saved.");
                            onClose();
                          },
                        },
                      )
                    }
                  >
                    Assign
                  </Button>
                </div>
              ))
            ) : (
              <p>No eligible replacements. Check exclusions below.</p>
            )}
            <details>
              <summary>Why other volunteers are excluded</summary>
              {query.data?.excluded.map((v) => (
                <p key={v.volunteerId}>
                  <strong>{v.name}</strong>, {v.reasons.join("; ")}
                </p>
              ))}
            </details>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function VolunteerDirectory({
  state: s,
  onEdit,
}: {
  state: EventState;
  onEdit: (v: Volunteer | "new") => void;
}) {
  const [query, setQuery] = useState(""),
    [skill, setSkill] = useState("all");
  const rows = s.volunteers.filter(
    (v) =>
      (v.name + " " + v.skills.join(" "))
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (skill === "all" || v.skills.includes(skill)),
  );
  return (
    <section>
      <div className="cc-section-heading">
        <div>
          <h2>Your volunteer crew</h2>
          <p>
            {s.volunteers.length} fictional profiles with verified scheduling
            constraints.
          </p>
        </div>
        <Button className="cc-primary" onClick={() => onEdit("new")}>
          <IconPlus size={16} />
          Add volunteer
        </Button>
      </div>
      <div className="cc-filters">
        <label className="cc-search">
          <IconSearch size={17} />
          <Input
            aria-label="Search volunteers"
            placeholder="Search your crew…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter by qualification"
          value={skill}
          onChange={(e) => setSkill(e.target.value)}
        >
          <option value="all">All qualifications</option>
          {[
            "Registration",
            "Safety",
            "Technical",
            "Guest services",
            "Logistics",
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <span>{rows.length} volunteers</span>
      </div>
      <div className="cc-table-scroll">
        <table className="cc-volunteer-table">
          <thead>
            <tr>
              <th scope="col">Volunteer</th>
              <th scope="col">Qualifications</th>
              <th scope="col">Available (WAT)</th>
              <th scope="col">Assigned / limit</th>
              <th scope="col">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((v) => (
              <tr key={v.id}>
                <th scope="row">
                  <span className="cc-person">
                    <span className="cc-avatar">{initials(v.name)}</span>
                    {v.name}
                  </span>
                </th>
                <td>
                  <div className="cc-skill-list">
                    {v.skills.map((skill) => (
                      <span key={skill}>{skill}</span>
                    ))}
                  </div>
                </td>
                <td>
                  {v.availability
                    .map(
                      (a) =>
                        `${time(a.start, s.timeZone)} to ${time(a.end, s.timeZone)}`,
                    )
                    .join(", ")}
                </td>
                <td>
                  {assignedHours(s, v.id)} / {v.maxHours} h
                </td>
                <td>
                  <button
                    className="cc-text-button"
                    onClick={() => onEdit(v)}
                    aria-label={`Edit ${v.name}`}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length ? (
          <div className="cc-no-results">
            No volunteers match these filters.
            <Button
              variant="outline"
              onClick={() => {
                setQuery("");
                setSkill("all");
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function VolunteerEditor({
  state: s,
  volunteer: v,
  onClose,
}: {
  state: EventState;
  volunteer: Volunteer | undefined;
  onClose: () => void;
}) {
  const dialogFocus = useDialogFocusReturn();
  const [name, setName] = useState(v?.name ?? ""),
    [skills, setSkills] = useState(v?.skills ?? ["Registration"]),
    [maxHours, setMaxHours] = useState(v?.maxHours ?? 8);
  const [start, setStart] = useState(
      eventInput(v?.availability[0]?.start ?? s.shifts[0]!.start, s.timeZone),
    ),
    [end, setEnd] = useState(
      eventInput(
        v?.availability[0]?.end ?? s.shifts.slice(-1)[0]!.end,
        s.timeZone,
      ),
    );
  const save = useActionMutation("update-volunteer", { onError: errorToast });
  function submit(e: FormEvent) {
    e.preventDefault();
    save.mutate(
      {
        eventId: s.id,
        ...(v ? { volunteerId: v.id } : {}),
        name,
        skills: skills as (
          | "Registration"
          | "Safety"
          | "Technical"
          | "Guest services"
          | "Logistics"
        )[],
        maxHours,
        availability: [
          {
            start: utcInput(start, s.timeZone),
            end: utcInput(end, s.timeZone),
          },
        ],
      },
      {
        onSuccess: () => {
          toast.success("Volunteer saved.");
          onClose();
        },
      },
    );
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="cc-dialog" {...dialogFocus}>
        <DialogHeader>
          <DialogTitle>{v ? "Edit volunteer" : "Add volunteer"}</DialogTitle>
          <DialogDescription>
            Availability uses {s.timeZone}. Changes must preserve existing
            assignments.
          </DialogDescription>
        </DialogHeader>
        <form className="cc-volunteer-form" onSubmit={submit}>
          <label>
            Name
            <Input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <fieldset>
            <legend>Qualifications</legend>
            {[
              "Registration",
              "Safety",
              "Technical",
              "Guest services",
              "Logistics",
            ].map((skill) => (
              <label className="cc-checkbox-label" key={skill}>
                <input
                  type="checkbox"
                  checked={skills.includes(skill)}
                  onChange={(e) =>
                    setSkills((current) =>
                      e.target.checked
                        ? [...current, skill]
                        : current.filter((x) => x !== skill),
                    )
                  }
                />
                {skill}
              </label>
            ))}
          </fieldset>
          <div className="cc-form-pair">
            <label>
              Available from
              <Input
                required
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              Available until
              <Input
                required
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>
          <label>
            Working-hour limit
            <Input
              required
              type="number"
              min={1}
              max={24}
              value={maxHours}
              onChange={(e) => setMaxHours(Number(e.target.value))}
            />
          </label>
          <Button
            className="cc-primary"
            type="submit"
            disabled={save.isPending || !skills.length}
          >
            {save.isPending ? "Saving…" : "Save volunteer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ActivityList({
  state: s,
  compact = false,
}: {
  state: EventState;
  compact?: boolean;
}) {
  const items = [...s.activity].reverse().slice(0, compact ? 4 : 200);
  return (
    <ol className={`cc-activity ${compact ? "compact" : ""}`}>
      {items.map((item) => (
        <li key={item.id}>
          <span
            className={`cc-activity-marker ${item.type === "cancellation" ? "danger" : item.type === "proposal" ? "pending" : "good"}`}
          >
            {item.type === "cancellation" ? (
              <IconX size={13} />
            ) : item.type === "proposal" ? (
              <IconSparkles size={13} />
            ) : (
              <IconCheck size={13} />
            )}
          </span>
          <div>
            <p>{item.message}</p>
            <span>
              <time dateTime={item.at}>
                {new Intl.DateTimeFormat("en-GB", {
                  timeZone: s.timeZone,
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(item.at))}
              </time>{" "}
              , Organizer
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}

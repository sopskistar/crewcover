import {
  IconArrowRight,
  IconCheck,
  IconShieldCheck,
  IconUserCheck,
} from "@tabler/icons-react";

import { CrewCoverMark } from "@/components/CrewCoverMark";

import styles from "../introduction.css?url";

export const links = () => [{ rel: "stylesheet", href: styles }];
const title = "CrewCover — Recover your event crew";
const description =
  "Recover from last-minute volunteer cancellations. Find qualified replacements and approve schedule repairs with an AI agent that shares your schedule.";
export function meta() {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://crewcover-iota.vercel.app/" },
    {
      property: "og:image",
      content: "https://crewcover-iota.vercel.app/og.png",
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      tagName: "link",
      rel: "canonical",
      href: "https://crewcover-iota.vercel.app/",
    },
  ];
}
const workflow = [
  "Cancellation",
  "Coverage gaps",
  "Qualified recommendations",
  "Human approval",
  "Recovered schedule",
];
const rows = [
  ["Welcome desk", "Isla Young", "Registration"],
  ["Safety & access", "Ava Bello", "Safety"],
  ["Stage & technical", "Liam Cruz", "Technical"],
];
export default function Introduction() {
  return (
    <div className="cc-intro">
      <a className="cc-skip-link" href="#main">
        Skip to content
      </a>
      <header className="cc-public-nav cc-public-container">
        <a className="cc-public-brand" href="/" aria-label="CrewCover home">
          <CrewCoverMark />
          CrewCover
        </a>
        <nav aria-label="Public navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#questions">FAQ</a>
          <a href="/sign-in">Sign in</a>
          <a className="cc-public-button" href="/operations">
            Get started <IconArrowRight size={16} />
          </a>
        </nav>
      </header>
      <main id="main">
        <section
          className="cc-public-hero cc-public-container"
          aria-labelledby="intro-title"
        >
          <div className="cc-public-hero-copy">
            <h1 id="intro-title">
              When your crew changes, your plan doesn’t have to.
            </h1>
            <p>
              Last-minute cancellations leave more than empty slots. CrewCover
              finds qualified replacements and helps you approve a plan that
              holds together.
            </p>
            <div className="cc-public-actions">
              <a className="cc-public-button" href="/operations">
                Get started <IconArrowRight size={18} />
              </a>
              <a className="cc-public-text-link" href="#how-it-works">
                See the recovery workflow
              </a>
            </div>
            <p className="cc-public-note">
              <IconShieldCheck size={17} /> Your schedule. Your final say.
            </p>
          </div>
          <figure
            className="cc-public-preview"
            aria-label="Read-only fictional repair preview"
          >
            <figcaption>
              <span>Gather 2026</span>
              <span>Fictional preview</span>
            </figcaption>
            <div className="cc-preview-heading">
              <div>
                <h2>
                  Three cancellations.
                  <br />
                  One reviewed repair.
                </h2>
                <p>Morning crew / 09:00–13:00 WAT</p>
              </div>
              <span className="cc-preview-state">Proposed</span>
            </div>
            <div className="cc-preview-coverage">
              <div>
                <span>Current coverage</span>
                <strong>85%</strong>
              </div>
              <IconArrowRight aria-label="proposed change" />
              <div>
                <span>After approval</span>
                <strong>100%</strong>
              </div>
            </div>
            <div className="cc-preview-rows">
              {rows.map(([role, name, skill]) => (
                <div key={role}>
                  <span>
                    {role}
                    <small>{skill} required</small>
                  </span>
                  <span>
                    <IconCheck size={15} />
                    {name}
                  </span>
                </div>
              ))}
            </div>
            <div className="cc-preview-footer">
              <IconUserCheck size={18} />
              <span>
                Qualified. Available. No double-booking.
                <br />
                <strong>Awaiting organizer approval.</strong>
              </span>
            </div>
            <p className="cc-preview-disclaimer">
              Illustrative demo state. No live organizer data.
            </p>
          </figure>
        </section>
        <section
          id="how-it-works"
          className="cc-public-workflow"
          aria-labelledby="workflow-title"
        >
          <div className="cc-public-container">
            <div className="cc-public-section-heading">
              <h2 id="workflow-title">From a gap to a plan.</h2>
              <p>The schedule stays the source of truth at every step.</p>
            </div>
            <ol>
              {workflow.map((step, i) => (
                <li key={step}>
                  <span className="cc-workflow-index">{i + 1}</span>
                  <strong>{step}</strong>
                  {i < 4 ? (
                    <IconArrowRight size={18} aria-hidden="true" />
                  ) : (
                    <IconCheck size={18} aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section
          className="cc-public-collaboration cc-public-container"
          aria-labelledby="collaboration-title"
        >
          <div>
            <h2 id="collaboration-title">
              The agent investigates.
              <br />
              You make the call.
            </h2>
            <p>
              Ask Gemini to inspect coverage, find qualified replacements and
              explain conflicts. Agent-Native gives the interface and agent the
              same typed operations and persisted schedule.
            </p>
            <a className="cc-public-text-link" href="/operations">
              Open your private workspace <IconArrowRight size={16} />
            </a>
          </div>
          <dl>
            <div>
              <dt>Rules before recommendations</dt>
              <dd>
                Skills, availability, overlaps, cancellations and hour limits
                are checked by deterministic scheduling logic.
              </dd>
            </div>
            <div>
              <dt>Approval before changes</dt>
              <dd>
                A repair is a proposal until you approve it. Constraints are
                checked again when assignments are saved.
              </dd>
            </div>
            <div>
              <dt>A record of the recovery</dt>
              <dd>
                Coverage, saved assignments and activity history show what
                actually changed.
              </dd>
            </div>
          </dl>
        </section>
        <section
          id="questions"
          className="cc-public-faq cc-public-container"
          aria-labelledby="faq-title"
        >
          <h2 id="faq-title">Before you get started.</h2>
          <div>
            <details>
              <summary>How are qualifications checked?</summary>
              <p>
                Organizers maintain each volunteer’s skills and availability.
                The scheduler matches the required skill and full shift, checks
                conflicts and cancellations, and enforces working-hour limits.
                It does not independently verify certifications.
              </p>
            </details>
            <details>
              <summary>Can the AI change the schedule on its own?</summary>
              <p>
                Repair proposals require explicit organizer approval. Manual
                assignments also require your confirmation and server
                validation. AI narration cannot override the scheduling rules.
              </p>
            </details>
            <details>
              <summary>Who can see my schedule?</summary>
              <p>
                Sign-in is required for event operations. Records are scoped to
                your organizer account. Gemini receives scheduling context when
                you ask it for help; never enter sensitive personal information
                into the fictional demo.
              </p>
            </details>
            <details>
              <summary>What does the demo include?</summary>
              <p>
                Your private Gather 2026 conference has 20 fictional volunteers
                and 20 staffed positions. Cancel Ada, Noah and Mia to create
                three vacancies, review a repair and approve recovery. Reset
                demo restores only your fictional event.
              </p>
            </details>
          </div>
        </section>
      </main>
      <footer className="cc-public-footer cc-public-container">
        <a className="cc-public-brand" href="/">
          <CrewCoverMark />
          CrewCover
        </a>
        <p>Emergency staffing. Human-approved recovery.</p>
        <a href="https://github.com/sopskistar/crewcover">
          Source & documentation <IconArrowRight size={15} />
        </a>
      </footer>
    </div>
  );
}

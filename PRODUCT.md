# CrewCover

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Event organizers coordinating volunteers for a conference, especially when last-minute cancellations leave essential posts uncovered. Volunteer profiles represent skills and availability; volunteer accounts are outside the MVP.

## Product Purpose

Recover event staffing after cancellations through accurate gap detection, qualified replacement recommendations, explicit organizer approval, and persisted schedule changes. Success is a reproducible cancellation-to-repair workflow using real shared application operations.

## Positioning

An Agent-Native operations workspace where the organizer and embedded AI inspect and change the same persisted schedule through typed actions. Deterministic eligibility checks enforce the rules; AI explains and orchestrates them. The repair engine remains usable without inference.

## Operating Context

Support one event well before multi-organization complexity. The demonstration uses a clearly fictional conference with approximately twenty volunteers, multiple staffing areas and time slots, three cancellable volunteers, and a repeatable reset. Preserve existing repository history and project work. Deployment targets Vercel Hobby with Neon PostgreSQL. The owner will record a public Clips demonstration after deployment; no Remotion or cinematic video work.

## Capabilities and Constraints

- Check availability, qualifications, half-open shift boundaries, overlap, cancellation/unavailability, and working-hour limits.
- Rank eligible replacements reproducibly and report unresolved gaps honestly.
- Require organizer approval of repairs, revalidate immediately before atomic persistence, and reject duplicate or stale approvals.
- Scope records to authenticated organizers. Keep credentials server-side and ignored by Git.
- Use the existing official standalone Agent-Native Chat starter, its supported database/migration layer, and shared `defineAction` operations for both UI and agent.
- Gemini is primary; OpenRouter is an optional manual alternative unless safe automatic fallback is implemented and tested.
- Provide operations, schedule, volunteer directory, repair review, embedded agent, and audit history with manual assignment controls.
- Budget and rate protections must guard public inference access.
- Required baseline: working application and persistence before optional visual effects or features.

## Brand Commitments

Name: CrewCover. Premium workforce operations interface with clear, concise, factual language. Initial direction: deep ink/navy structure, light working surfaces, teal for healthy coverage, amber for pending proposals, and coral/red for gaps. Avoid generic AI marketing, fake metrics, stock illustration, gradients, and clutter. Use a simple original coverage/coordination mark and purposeful motion with reduced-motion support.

## Evidence on Hand

- Original product statement: `README.md`.
- Official starter source is integrated at repository root. Original starter documentation and visual contract are preserved under `docs/framework/`.
- User supplied the complete required workflow, safety constraints, deployment target, and acceptance criteria on November 9, 2026.
- Conference names, volunteers, and scenarios are synthetic. No customer testimonials, adoption metrics, live deployment proof, or Clips recording currently exist; do not invent them.

## Product Principles

1. The persisted schedule is the shared source of truth for organizer and agent.
2. Eligibility and concurrency rules outrank AI recommendations.
3. Explain proposals before approval; show what actually changed afterward.
4. Preserve human control and make unresolved coverage visible.
5. Demonstrate real operations and report only checks that were run.

## Accessibility & Inclusion

Support keyboard operation, labeled controls, responsive desktop/tablet/mobile use, clear loading/error/empty states, and reduced motion. Status must remain understandable without color alone. Display event-local times consistently while storing UTC instants.

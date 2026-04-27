# Threat Model

## Project Overview

Corion Gutachter is a public-facing business website for a German automotive appraisal company. The deployed application is a hybrid of static HTML pages and a React/Vite frontend served by a Node.js/Express backend with PostgreSQL storage. The backend also calls external AI providers for the accident assistant and CORA chat, and sends analytics events to Google Analytics.

Production assumptions for this scan:
- The deployed runtime is `server/index.ts` with `NODE_ENV=production`.
- Replit-managed TLS protects browser-to-server traffic.
- Mockup/sandbox environments are not deployed to production.
- Legacy PHP files are not executed in the current production deployment unless a future deployment path explicitly serves them.

There is no end-user login system in the current application. Most server routes are therefore public unless they implement their own server-side access control.

## Assets

- **Lead and contact data** — names, email addresses, phone numbers, free-form contact messages, and repair request metadata stored in `repair_requests`. This is customer PII and business lead data.
- **Chat transcripts** — CORA conversation history stored in `orchestrator_conversations` and `orchestrator_messages`. Users may place accident details, contact information, or other sensitive facts into chat.
- **AI provider budget and service availability** — public endpoints invoke OpenAI and Gemini-backed models. Abuse can directly increase operating cost and degrade service.
- **Application secrets** — `DATABASE_URL`, AI integration credentials, and GA4 API secret. Compromise would expose stored data or enable third-party abuse.
- **Analytics integrity** — server-side GA4 tracking should reflect genuine site actions and should not become an unbounded abuse channel.

## Trust Boundaries

- **Browser to Express API** — all form submissions, AI requests, and chat interactions cross from an untrusted client into server handlers. Every field in `req.body`, route params, and headers must be treated as attacker-controlled.
- **Express to PostgreSQL** — the server stores repair requests and chat history in the database. Any access-control failure at the API layer can expose or destroy stored customer data.
- **Express to external AI services** — `server/routes.ts` and `server/orchestrator/router.ts` send user-supplied text to external model APIs. These calls spend tokens and can amplify attacker-controlled load.
- **Express to GA4 Measurement Protocol** — `/api/track-event` forwards selected client-supplied values to Google Analytics using a server-held secret. This boundary must prevent misuse and avoid exposing the secret.
- **Public vs administrative/business-only data** — the public website is intentionally open, but lead data and stored conversations are not public content and require explicit server-side protection.
- **Current production vs dormant code** — static HTML routes and the Express APIs registered in `server/index.ts` are in scope. Legacy PHP files (`process-form.php`, `save-chat.php`) and currently unregistered modules under `server/replit_integrations/` are usually out of scope unless future code makes them reachable in production.

## Scan Anchors

- **Production entry points:** `server/index.ts`, `server/routes.ts`, `server/orchestrator/router.ts`, static HTML files explicitly routed by `server/index.ts`, and the React app served from `/gutachter`.
- **Highest-risk code areas:** `server/routes.ts` (lead intake, public data readback, GA4 forwarding), `server/orchestrator/router.ts` and `server/orchestrator/storage.ts` (public AI chat plus transcript storage), and client components that render AI output (`client/src/components/gutachter/UnfallAssistentSection.tsx`, static `index.html`).
- **Public surfaces:** all currently registered `/api/*` routes are publicly reachable; there is no authenticated user or admin session layer.
- **Usually ignore unless reachability changes:** `process-form.php`, `save-chat.php`, `uploads/`, `chat_logs/`, and `server/replit_integrations/*` routes not registered by `server/index.ts`.

## Threat Categories

### Spoofing / Access Control

The application has no user or admin authentication layer, but it still exposes business data and stateful chat operations over public API routes. Any route that returns stored submissions, reads prior chat context, or deletes server-side data must enforce a real server-side authorization decision instead of relying on obscurity, frontend intent, or caller-supplied identifiers.

Required guarantees:
- Routes that expose lead data or other non-public records MUST require a server-side authorization mechanism.
- Routes that act on stored conversation state MUST bind that state to an authorization mechanism or an unguessable capability that is treated as a secret.
- “Admin” behavior documented in comments or `replit.md` MUST not be exposed on public routes without enforcement.

### Tampering

Attackers can submit arbitrary JSON to every public endpoint. Server handlers must not trust client-side validation, client-provided consent flags, analytics metadata, or caller-chosen conversation identifiers. Public delete or mutation routes are especially sensitive because they can destroy data or poison stored context.

Required guarantees:
- Input validation MUST happen server-side for all public POST and DELETE routes.
- Stored conversation state MUST not be mutable by unrelated callers.
- Analytics and logging endpoints MUST constrain accepted fields and be resilient to abuse.

### Information Disclosure

The application stores customer leads and chat transcripts that may contain PII. Disclosure risks are concentrated in routes that return database rows directly, in any transcript-replay behavior tied only to a session identifier, and in client-side rendering of model output or verbose errors.

Required guarantees:
- Customer lead data and chat history MUST not be retrievable by unauthenticated public callers.
- API responses MUST return only the minimum fields needed by the caller.
- Model output rendered in the browser MUST be treated as untrusted content and sanitized or rendered as text/strict markdown.
- Server errors MUST avoid leaking secrets, stack traces, or raw provider responses to clients.

### Denial of Service

Several public endpoints trigger paid or computationally expensive work, especially the accident assistant and CORA chat. Without request throttling, quotas, payload limits, or timeouts, an attacker can drive token spend, database growth, and long-lived streaming connections.

Required guarantees:
- Public AI endpoints MUST enforce rate limits or equivalent abuse controls.
- Request sizes and conversation history windows MUST be bounded deliberately.
- External API calls SHOULD use timeouts and graceful failure handling.
- Stored chat and lead data SHOULD have retention or growth controls appropriate to business need.

### Elevation of Privilege

Because there is no authenticated privilege model, the main elevation risk is exposing privileged business functionality as if it were public content. A route intended for internal/admin visibility can become a direct privilege boundary failure if it returns all stored requests or permits unrestricted state changes.

Required guarantees:
- Internal/business-only data access MUST be separated from public website functionality.
- Sensitive routes MUST not rely on route naming, hidden frontend links, or same-origin assumptions for protection.

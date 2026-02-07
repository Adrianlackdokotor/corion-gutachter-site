# BACKLOG.md - Corion Project Master Log

## 1. Project Status
- **Current Phase:** Scaling & Integration (Fuziune Sisteme)
- **Active Focus:** Implementarea Orchestratorului AI Central (CORA) și unificarea ecosistemului (Gutachter, Academy, Partner).

## 2. Task List (The Board)

| ID | Status | Priority | Owner | Description |
| :--- | :--- | :--- | :--- | :--- |
| T-001 | 🟢 Done | High | AGENT | Create `BACKLOG.md` and define project governance structure. |
| T-002 | 🟢 Done | High | AGENT | Implement `GamifiedDashboard` for Partners (XP, Levels). |
| T-003 | 🟢 Done | High | AGENT | Create `Gutachter` landing page with AI integration. |
| T-004 | 🟢 Done | High | AGENT | Build `Academy` multimedia platform skeleton. |
| T-005 | 🟢 Done | High | AGENT | Implement `Financial Engine` (Onboarding & Security Deposit logic). |
| T-006 | 🟢 Done | High | AGENT | **Develop Master Orchestrator (CORA Router)** for Multi-Agent System. |
| T-007 | 🔴 To Do | Med | AGENT | Connect Orchestrator to external GPTs (HR, Meister, Architect). |
| T-008 | 🔴 To Do | Med | HUMAN | Review and deploy new features in Replit. |

## 3. T-006 Implementation Details — CORA Orchestrator

### Architecture
```
User Message → /api/orchestrator/chat/stream (SSE)
                    ↓
            Intent Classifier (gpt-4o-mini, temp=0.1)
                    ↓
            Skill Router (4 registered skills)
                    ↓
            ┌───────────────────────────────────────┐
            │  gutachter  │  sales  │ academy │ gen  │
            │  Kfz-Expert │ Partner │ Kurse   │ FAQ  │
            └───────────────────────────────────────┘
                    ↓
            Skill-specific System Prompt + Conversation History
                    ↓
            OpenAI gpt-4o-mini → Streaming Response (SSE)
                    ↓
            PostgreSQL Logging (orchestrator_messages)
```

### Files Created
- `server/orchestrator/skills.ts` — Skill registry with 4 skills + classifier prompt
- `server/orchestrator/router.ts` — Express routes (chat, stream, skills list, delete)
- `server/orchestrator/storage.ts` — PostgreSQL conversation & message storage
- `server/orchestrator/index.ts` — Module exports
- `client/src/components/gutachter/CoraChat.tsx` — Frontend chat widget with streaming UI

### API Endpoints
- `POST /api/orchestrator/chat` — Non-streaming chat
- `POST /api/orchestrator/chat/stream` — Streaming chat via SSE
- `GET /api/orchestrator/skills` — List available skills
- `DELETE /api/orchestrator/conversation/:sessionId` — Delete conversation

### Database Tables
- `orchestrator_conversations` (id, session_id, skill_id, created_at, updated_at)
- `orchestrator_messages` (id, conversation_id, role, content, skill_id, created_at)

## 4. Change Log & Audit Trail

| Date/Time | Actor | File Modified | Action Taken |
| :--- | :--- | :--- | :--- |
| 2026-02-07 02:20 UTC | [AGENT] | `server/orchestrator/*` | Built CORA Multi-Agent Orchestrator (skills, router, storage). |
| 2026-02-07 02:20 UTC | [AGENT] | `client/src/components/gutachter/CoraChat.tsx` | Created CORA chat widget with streaming SSE UI. |
| 2026-02-07 02:20 UTC | [AGENT] | `server/index.ts` | Wired orchestrator routes and DB init. |
| 2026-02-07 02:20 UTC | [AGENT] | `replit.md` | Updated project documentation with new architecture. |
| 2026-02-07 02:15 UTC | [AGENT] | `BACKLOG.md` | Initialized file structure and logged recent progress. |
| 2026-02-07 02:00 UTC | [AGENT] | `server/routes.ts` | Upgraded AI endpoint to use OpenAI SDK via Replit AI Integrations. |
| 2026-02-07 01:40 UTC | [AGENT] | `client/src/pages/GutachterPage.tsx` | Created full Gutachter landing page with 9 sections. |

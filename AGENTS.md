# # [AGENT Guidelines](http://AGENTS.md)

## Context & Rules

- **Stack:** Next.js +16 (App Router, TS), PostgreSQL, Prisma ORM.
- **Database:** Refer strictly to `.cursor/rules/prisma.mdc`.
- **Next.js Architecture:** Follow the provided Next.js project Skill exactly `.agents/nextjs-monolith-architecture`.

## Workflow & PRs

- **Atomic Scope:** One change per cycle. Focus on a single component or section (never entire pages).
- **Documentation:** Upon task completion, generate a summary matching the `.github/pull_request_template.md` layout.

## Strict Behavior Directives

- **Zero Assumptions:** Do not assume or invent business logic, styling, libraries, or rules not explicitly stated in the prompt.
- **No Self-Decision:** Never make architectural, flow, or design choices on your own. If information is missing or ambiguous, stop execution immediately and ask for clarification.
- **Literal Execution:** Limit yourself exclusively to implementing what was requested in the most direct, clean, and minimal way possible, adhering strictly to the existing codebase structure.


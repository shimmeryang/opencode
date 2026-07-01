# Repository Guide

## Essentials

- Bun is required (`packageManager`: `bun@1.3.14`); use `bun install` from the repo root.
- The default branch is `dev`; local `main` may not exist, so diff against `dev` or `origin/dev`.
- Root `bun test` intentionally fails via `do-not-run-tests-from-root`; run tests from the package that owns the change.
- Root `bun typecheck` runs `bun turbo typecheck`; package-level typechecks are `bun typecheck` from the package directory and use `tsgo`, not direct `tsc`.
- Root lint is `bun lint` (`oxlint`). Formatting is `./script/format.ts`.

## Common Commands

- CLI/TUI dev from root: `bun dev [directory]`; use `bun dev .` to run against this repo, `bun dev serve --port 4096` for the headless server, and `bun dev web` for server + web.
- `packages/opencode`: `bun dev`, `bun test`, `bun typecheck`, `bun run test:httpapi`, `bun run build`.
- `packages/core`: `bun test`, `bun typecheck`, `bun run db`, `bun run migration`.
- `packages/app`: `bun dev`, `bun test`, `bun run test:e2e:local`, `bun typecheck`; Playwright uses Chromium and `PLAYWRIGHT_*` env vars from `playwright.config.ts`.
- Focused Bun tests: run from the owning package, e.g. `bun test test/foo.test.ts --only-failures` or the package's existing `test` script.

## Generated Code

- After public Protocol or Server `HttpApi` changes, run `bun run generate` from `packages/client`; do not edit `packages/client/src/generated` or `packages/client/src/generated-effect` directly.
- To verify generated client output without keeping changes: `bun run check:generated` from `packages/client`.
- Legacy JS SDK generation is `./packages/sdk/js/script/build.ts`; root `./script/generate.ts` runs legacy SDK generation, `bun dev generate` from `packages/opencode`, then formatting.

## Package Boundaries

- Runtime dependency direction: `schema -> protocol -> server`; `core` may compose runtime behavior; `client` runtime depends on `schema`/`protocol` but not `core`/`server`; `sdk-next` composes client, core, and server.
- `packages/opencode` owns CLI, server orchestration, session runtime, config, permissions, tools, and integrations.
- `packages/core` owns reusable runtime services and Drizzle schema/migrations (`packages/core/src/**/*.sql.ts`, `packages/core/migration`).
- `packages/schema` owns browser-safe wire/storage contracts only; read `packages/schema/AGENTS.md` before changing public contracts.
- `packages/llm` is the Effect Schema-first LLM core; keep session auth/plugins/permissions in `packages/opencode/src/session/llm.ts` and adapters, not in `packages/llm`.
- `packages/app` is the Solid/Vite web UI; `packages/desktop` is Electron around the app; `packages/tui` is the OpenTUI/Solid terminal UI.

## Local UI / TUI Gotchas

- For app UI/CSS changes, do not rely on `opencode dev web` because it proxies `https://app.opencode.ai`; run backend `bun run --conditions=browser ./src/index.ts serve --port 4096` from `packages/opencode` and app `bun dev -- --port 4444` from `packages/app`.
- Running `bun dev` from `packages/opencode` starts an interactive TUI; use a background terminal/tmux and stop it explicitly when done.
- Desktop renderer code should call only `window.api` from `packages/desktop/src/preload`; main-process IPC handlers live in `packages/desktop/src/main/ipc.ts`.

## Code Style That Differs From Defaults

- Prefer Bun APIs (`Bun.file`, `Bun.write`) where appropriate; avoid `any`, unnecessary `let`, unnecessary destructuring, and avoid `else` after early returns.
- Do not add comments unless they explain non-obvious constraints or surprising behavior.
- Do not alias imports or use star imports; import the module's exported namespace by name (for example `import { Project } from "@opencode-ai/core/project"`).
- Module organization uses flat exports plus self-reexport (`export * as Foo from "./foo"`); do not use `export namespace Foo {}`. For single-module `index.ts`, self-reexport from `"."`; avoid barrel `index.ts` files for multi-sibling directories.
- Drizzle schema fields use snake_case property names so column names do not need explicit strings.

## Effect Conventions

- Use the repo's `effect` skill when editing Effect v4 / effect-smol code.
- In generators, bind services to named variables before calling methods; do not write nested service yields like `yield* (yield* Foo.Service).bar()`.
- Prefer `Effect.gen`, `Effect.fn`, `Effect.void`, `Schema.Class`, branded schemas, `Schema.TaggedErrorClass`, and `yield* new MyError(...)` for direct failures.
- Use Effect platform services (`FileSystem`, `HttpClient`, `Path`, `Clock`, `DateTime`, `ChildProcessSpawner`) instead of raw platform APIs inside Effect code.
- `Effect.fork`/`forkDaemon` are not available in this Effect v4 beta; fork into a scope with `Effect.forkIn(scope)` or use repo patterns.

## Tests

- Avoid mocks where possible; test real implementation and avoid duplicating implementation logic in tests.
- For `packages/opencode` Effect tests, use `testEffect(...)` and fixtures documented in `packages/opencode/test/AGENTS.md`; prefer readiness signals over fixed sleeps for concurrent work.
- For `packages/llm` provider tests, replay fixtures by default; live calls require `RECORD=true` plus provider API-key env vars, and narrow filters such as `RECORDED_PROVIDER`, `RECORDED_PREFIX`, `RECORDED_TAGS`, or `RECORDED_TEST`.

## Git / PR Conventions

- Branch names: max three short words, hyphen-separated, no slashes or type prefixes (for example `session-recovery`).
- Commits and PR titles use conventional style: `feat|fix|docs|chore|refactor|test(scope): summary`.
- PRs are expected to link an issue, explain verification, stay focused, and include screenshots/recordings for UI changes.

## More Specific Instructions

- Package-level `AGENTS.md` files override or extend this guide; check them before touching `packages/opencode`, `packages/schema`, `packages/llm`, `packages/app`, `packages/desktop`, tests, server routes, or tools.

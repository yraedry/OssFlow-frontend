---
name: OssFlow Frontend Architecture
description: Key architectural patterns, conventions, and codebase structure for OssFlow-frontend React app
type: project
---

## Stack
React 18 + TypeScript + Vite + TailwindCSS v4 + TanStack Query v5 + ky (HTTP client) + zustand (auth store) + react-router-dom v6 + Playwright (Brave) e2e tests.

## Feature-Sliced Structure
`src/features/<domain>/<entity>/` with fixed sub-folders:
- `api.ts` — ky-based API functions, typed with interface `PageResponse<T>` or `Page<T>` from `@/shared/types/pagination`
- `hooks.ts` — react-query hooks (`useQuery`, `useMutation`), exports `<ENTITY>_KEY` constant
- `types.ts` — TypeScript interfaces
- `schemas.ts` — Zod schemas for forms
- `components/` — entity-specific components
- `pages/` — page-level components

## Domains
- `features/catalog/` — technique, position, system, exercise, ruleset
- `features/journal/` — note, trainingsession, physicalsession
- `features/planning/` — studyblock, studyitem, studyplan, weeklytemplate
- `features/competition/` — log, match
- `features/identity/` — profile, injury, federation
- `features/auth/` — pages, store (Zustand), api (separate ky client at `/api/auth`)

## Shared Layer
- `src/shared/api/client.ts` — `apiClient` ky instance with prefix `/api/v1`, JWT bearer injection, silent refresh on 401
- `src/shared/components/ui/` — reusable UI components (button, input, dialog, spinner, etc.)
- `src/shared/hooks/` — useConfirm, useConfirmDelete, useFabNew, useAvatar, useTheme, useDebounce
- `src/shared/types/pagination.ts` — `Page<T>` type

## Visual System (index.css)
- `--radius: 0rem` — no border radius anywhere
- Fonts: `--font-serif: Playfair Display`, `--font-sans: Inter`, `--font-mono: JetBrains Mono`
- All labels: `font-mono`, `uppercase`, `tracking-widest`, `text-[10px]`
- CSS variable theming, light/dark mode via `.dark` class
- TailwindCSS v4 with `@theme {}` block

## API Conventions
- All catalog endpoints at `/api/v1/catalog/<entity>` (GET, POST, PATCH/PUT, DELETE)
- Pagination: `?page=0&size=20`, returns `{ content, totalElements, totalPages, ... }`
- Server-side search: `?search=<query>` works for techniques, positions, systems, rulesets
- Exercises endpoint does NOT support `?search=` (returns 500 — use client-side filter)
- Auth endpoints at `/api/auth` (separate ky client, no /v1 prefix)

## Playwright E2E
- Config: `playwright.config.ts` uses `baseURL: http://localhost:5173` and Brave Browser
- Tests in `e2e/` directory, screenshots in `e2e/screenshots/`
- Auth is NOT persisted to localStorage (in-memory Zustand). To test authenticated pages, mock `/api/auth/refresh` and `/api/v1/identity/profile` with `page.route()`
- The Vite dev server for THIS repo may run on different port (5178+) if 5173-5177 are taken by other processes
- Tests must hardcode the actual running port, not rely on playwright.config.ts baseURL

## Why
- **Why** dev server port varies: other OssFlow-frontend instances from old repo paths run on 5173-5177

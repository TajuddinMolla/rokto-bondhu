<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Global Form & API Development Rules — RoktoBondhu

These rules apply to the entire RoktoBondhu project and every future development phase.

## 1. React Hook Form — Mandatory for All Forms
- Every form must use React Hook Form (`useForm()`, `Controller`, `register()`, `handleSubmit()`, `formState.errors`).
- Use `defaultValues`, `useWatch()`, and `reset()`.
- Avoid managing individual form fields with separate `useState()` calls.

## 2. Zod Validation
- Use Zod for form validation and integrate it with React Hook Form through `@hookform/resolvers/zod`.
- Reuse existing Zod schemas wherever possible.
- Provide user-friendly Bangla and English validation messages.

## 3. TanStack React Query — Mandatory for Client API Calls
- `useQuery()` for reading API data.
- `useMutation()` for creating, updating, deleting data.
- `useInfiniteQuery()` for pagination/infinite scroll.
- Organized query keys and cache invalidation via `useQueryClient()`.

## 4. API Architecture
- Keep API calls outside UI components (`lib/api/client.ts`, `services/*.service.ts`, `hooks/queries/*.ts`, `hooks/mutations/*.ts`).
- UI components render data and states, never calling `fetch()` or Axios directly for client API requests.

## 5. Important Exceptions
- Firebase SDK operations not calling custom HTTP APIs may use dedicated auth services and React state/context.
- Static constants, local-only form validation, Server Components, and purely local UI state do not need React Query.

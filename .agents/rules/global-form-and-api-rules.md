# Global Form & API Development Rules — RoktoBondhu

These rules apply to the entire RoktoBondhu project and every future development phase.

## 1. React Hook Form — Mandatory for All Forms

**Every form must use React Hook Form.**

This includes:
- Login and registration
- Forgot password and reset password
- Donor registration and profile editing
- Blood request creation and editing
- Search and filter forms
- Admin forms
- All future forms

Requirements:
- Use `useForm()` for form state and submission.
- Use `Controller` for controlled or third-party form components when necessary.
- Use `register()` for compatible native inputs.
- Use `handleSubmit()` for form submission.
- Use `formState.errors` for validation feedback.
- Avoid managing individual form fields with separate `useState()` calls.
- Use `useWatch()` when a field's value needs to control another field.
- Use `reset()` when initializing or resetting form values.
- Use `defaultValues` to establish predictable form state.

## 2. Zod Validation

Use Zod for form validation and integrate it with React Hook Form through `@hookform/resolvers/zod`.

Requirements:
- Reuse existing Zod schemas wherever possible.
- Keep schemas in appropriate validation modules.
- Avoid duplicating validation rules across components.
- Provide user-friendly Bangla and English validation messages.
- Use the existing validation architecture for phone numbers, blood groups, locations, dates, and other domain fields.
- Never rely solely on frontend validation for future backend security.

Install `react-hook-form`, `zod`, and `@hookform/resolvers` only if they are not already installed and required.

## 3. TanStack React Query — Mandatory for Client API Calls

**Every client-side API request must use TanStack React Query.**

Use:
- `useQuery()` for fetching and reading API data.
- `useMutation()` for creating, updating, or deleting data and other API actions.
- `useInfiniteQuery()` for infinite scrolling or cursor-based pagination.
- `useQueryClient()` for cache invalidation and updates.
- Query keys organized in a consistent, reusable structure.

Examples:
- Fetching donor lists
- Fetching blood requests
- Loading user profiles
- Updating donor availability
- Creating or updating blood requests
- Login/register API mutations if authentication is later handled by a custom API
- Admin dashboard API requests

Use the existing API client, query provider, hooks, and query-key conventions if available. Do not create duplicate infrastructure.

## 4. API Architecture

Keep API calls outside UI components.

Use a maintainable structure similar to:

```text
lib/
  api/
    client.ts

services/
  donor.service.ts
  blood-request.service.ts
  user.service.ts

hooks/
  queries/
    use-donors.ts
    use-blood-requests.ts
    use-user-profile.ts
  mutations/
    use-create-blood-request.ts
    use-update-donor-profile.ts
```

Responsibilities:
- **API client:** HTTP configuration, base URL, headers, and shared error handling.
- **Service layer:** Actual endpoint requests.
- **React Query hooks:** Query/mutation lifecycle, caching, retries, and invalidation.
- **UI components:** Render data, handle user interaction, and display loading/error/success states.

Do not call `fetch()` or Axios directly inside UI components for ordinary client-side API operations. Put the request in the service layer and invoke it through a React Query hook.

## 5. Important Exceptions

Do not force React Query into situations where it is not appropriate.
- Firebase SDK operations that do not call a custom HTTP API may use dedicated auth services and React state/context.
- Static constants and local-only form validation do not need React Query.
- Server Components may fetch data on the server using the existing server-side data-access architecture.
- Server Actions, if introduced, must follow the project's established conventions rather than being wrapped artificially in a client query.
- Purely local UI state does not need React Query.

For custom API calls triggered from the client, React Query remains mandatory.

## 6. React Query Best Practices

- Use stable, structured query keys.
- Configure stale time and cache behavior intentionally.
- Invalidate or update relevant queries after successful mutations.
- Handle loading, error, empty, and success states.
- Avoid unnecessary duplicate requests.
- Do not retry non-idempotent mutations automatically without a clear reason.
- Prevent stale responses from overwriting newer state.
- Support cancellation through `AbortSignal` when applicable.
- Never put passwords, private tokens, or sensitive personal information in query keys.
- Do not store sensitive authentication data in the React Query cache unnecessarily.

## 7. Forms and API Integration

When a form submits data to a custom API:
1. React Hook Form manages form state.
2. Zod validates the submitted values.
3. `handleSubmit()` invokes the submit handler.
4. A React Query `useMutation()` hook calls the service layer.
5. The UI displays loading, validation, API error, and success states.
6. Relevant cached queries are updated or invalidated after success.

Do not call the API directly from the form component.

For Firebase Auth operations, use a dedicated authentication service and appropriate auth-state handling. Do not create fake HTTP endpoints solely to satisfy the React Query rule.

## 8. TypeScript and Code Quality

- Use proper TypeScript types for form values, API responses, and mutation variables.
- Avoid `any` unless genuinely unavoidable.
- Keep API response types separate from form input types where appropriate.
- Avoid duplicated validation, API logic, and query logic.
- Follow existing naming and folder conventions.
- Reuse existing UI components and design tokens.
- Do not add unnecessary dependencies.

## 9. Before Implementing Any Phase

Before coding:
1. Inspect the existing form and API architecture.
2. Identify which forms need React Hook Form.
3. Identify which client API operations need React Query.
4. Check whether required packages and providers already exist.
5. Present the affected files and implementation plan.
6. Wait for approval before making changes to substantial features.

Do not rewrite working code unnecessarily. Apply these rules incrementally to new features and refactor existing code only when it is in scope.

## 10. Verification

After implementation, verify:
- Forms use React Hook Form.
- Form validation uses the existing Zod architecture.
- Client-side API requests use React Query.
- API calls are separated from UI components.
- Loading, error, and success states work correctly.
- Query invalidation and cache updates are correct.
- TypeScript, lint, and build checks pass.

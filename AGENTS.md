# Architecture
- Keep the application on React/Vite and use JWT-verified Cloud Edge Functions for AI calls, because secrets cannot be exposed to the browser.
- Keep the academic workspace separate from the existing academic world, because both experiences must remain accessible.
- Derive the active assistant thread from its route and persist AI SDK UI messages per owner-scoped thread, because reloads and device changes must preserve isolated conversations.
- Scope shared materials to explicit career membership and use private file storage, because study resources are not public uploads.
- Generate and grade learning checks on the server and save each attempt, because progress must reflect submitted answers.
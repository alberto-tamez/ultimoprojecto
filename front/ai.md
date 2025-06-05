# AI Development Log

## 2025-06-04

### Task: Fix Sign-Out Redirect to Localhost
-   **Change 1**: Modified `components/auth/sign-out-button.tsx`.
    -   **Reason**: The sign-out button was redirecting to `localhost:3000/signed-out` instead of the URL specified by `NEXT_PUBLIC_APP_URL` after the logout process. This occurred even though the server-side logout API seemed correctly configured.
    -   **Modification**: Updated the `handleSignOut` function to explicitly read `process.env.NEXT_PUBLIC_APP_URL`. Constructed the target signed-out URL (e.g., `http://<app_url>/signed-out`) using this environment variable. After the `fetch` call to `/api/auth/logout` completes, the client now explicitly navigates to this correctly constructed URL if not already there. This ensures the redirect destination uses the proper domain/host from the environment configuration, overriding any potentially incorrect URL (like `localhost`) that might have come from `response.url` in the `fetch` chain. Added a console warning if `NEXT_PUBLIC_APP_URL` is not set.
    -   **Impact**: The sign-out flow now correctly redirects users to the `/signed-out` page on the domain specified by `NEXT_PUBLIC_APP_URL`, resolving the issue of being redirected to `localhost`.

import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route for everything under /admin. It renders no UI of its own —
// /admin (the dashboard list) lives in admin.index.tsx, and /admin/new and
// /admin/$id/edit are separate child routes. Without this Outlet, those
// child routes matched the URL but never actually rendered anything,
// which is why "New post" and the edit (pencil) button appeared to do nothing.
export const Route = createFileRoute("/_authenticated/admin")({
  component: () => <Outlet />,
});

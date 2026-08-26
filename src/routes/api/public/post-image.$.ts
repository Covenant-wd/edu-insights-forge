import { createFileRoute } from "@tanstack/react-router";

/**
 * The post-images bucket is public now, so newly uploaded images resolve
 * directly from Supabase Storage's own URL (see src/lib/post-image-upload.ts)
 * with no server involved. This route only exists so posts saved before
 * that change — whose content/cover_image still reference
 * `/api/public/post-image/<path>` — keep resolving. It's a redirect, not a
 * byte proxy, so it has no dependency on the service-role key.
 */
export const Route = createFileRoute("/api/public/post-image/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const base = process.env.SUPABASE_URL;
        if (!base) return new Response("Not found", { status: 404 });

        return Response.redirect(`${base}/storage/v1/object/public/post-images/${path}`, 302);
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listCategories, listAllPublishedSlugs } from "@/lib/posts.functions";
import { SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL;

const STATIC_PATHS = ["/", "/search"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [cats, posts] = await Promise.all([listCategories(), listAllPublishedSlugs()]);
        const entries: { path: string; lastmod?: string }[] = [
          ...STATIC_PATHS.map((p) => ({ path: p })),
          ...cats.map((c: any) => ({ path: `/category/${c.slug}` })),
          ...posts.map((p: any) => ({ path: `/post/${p.slug}`, lastmod: p.updated_at })),
        ];
        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${new Date(e.lastmod).toISOString()}</lastmod>` : null,
            `  </url>`,
          ].filter(Boolean).join("\n"),
        );
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});

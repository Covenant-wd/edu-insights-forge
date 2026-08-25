import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Sparkles } from "lucide-react";
import { listArchive } from "@/lib/archive.functions";
import { ARCHIVE_CATEGORIES } from "@/lib/archive-categories";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import { ArchiveCard } from "@/components/archive-card";
import { SITE_URL } from "@/lib/site";

const archiveQuery = queryOptions({
  queryKey: ["archive"],
  queryFn: () => listArchive(),
});

export const Route = createFileRoute("/archive")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(archiveQuery);
  },
  head: () => ({
    meta: [
      { title: "Academia HQ Blog" },
      {
        name: "description",
        content:
          "Download free lesson notes, schemes of work, exam series, AI prompt formats and AI class guides for teachers and students.",
      },
      { property: "og:title", content: "Academia HQ Blog" },
      {
        property: "og:description",
        content: "Archive of downloadable lesson notes, schemes of work, exam series and AI resources for teachers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/archive` }],
  }),
  errorComponent: ({ error }) => (
    <div role="alert" className="container-blog py-16 text-center text-muted-foreground">{error.message}</div>
  ),
  notFoundComponent: () => <div className="container-blog py-16 text-center">No resources found.</div>,
  component: ArchivePage,
});

function ArchivePage() {
  const { data } = useSuspenseQuery(archiveQuery);
  const [active, setActive] = useState<string>("all");

  const items = active === "all" ? data : data.filter((r) => r.category === active);

  return (
    <div className="container-blog py-10">
      <div className="border-b border-border/60 pb-6">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Archive
        </div>
        <h1 className="mt-2 text-2xl md:text-3xl font-extrabold tracking-tight">Downloads & teaching resources</h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Free, ready-to-use materials for teachers and students — subject lesson notes, schemes of work, exam series, AI prompt formats and
          practical guides on using AI in class.
        </p>
      </div>

      <AdSlot format="leaderboard" className="hidden md:flex mt-8" />
      <AdSlot format="mobile-banner" className="md:hidden mt-8" />

      <div className="mt-8 neu-sm p-5 flex flex-wrap gap-2">
        <FilterChip label="All resources" active={active === "all"} onClick={() => setActive("all")} />
        {ARCHIVE_CATEGORIES.map((c) => (
          <FilterChip key={c.key} label={c.label} active={active === c.key} onClick={() => setActive(c.key)} />
        ))}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((r) => (
          <ArchiveCard key={r.id} item={r} />
        ))}
      </div>

      {items.length === 0 && (
        <div className="mt-8 neu-inset p-12 text-center">
          <h3 className="text-lg font-semibold">Nothing here yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">New downloads are added to this archive regularly — check back soon.</p>
          <Link to="/" className="inline-flex mt-4"><Button variant="outline">Back to blog</Button></Link>
        </div>
      )}
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
        active
          ? "neu-interactive bg-primary text-primary-foreground shadow-md"
          : "neu-sm text-muted-foreground hover:text-foreground hover:shadow-md"
      }`}
    >
      {label}
    </button>
  );
}

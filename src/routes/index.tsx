import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Mail, TrendingUp, FolderDown } from "lucide-react";
import { listHomePosts, listCategories } from "@/lib/posts.functions";
import { listArchiveHighlights } from "@/lib/archive.functions";
import { ARCHIVE_CATEGORIES } from "@/lib/archive-categories";
import { PostCard } from "@/components/post-card";
import { ArchiveCard } from "@/components/archive-card";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SITE_URL } from "@/lib/site";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => listHomePosts(),
});
const catsQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});
const archiveHighlightsQuery = queryOptions({
  queryKey: ["archive-highlights"],
  queryFn: () => listArchiveHighlights(),
});


export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(homeQuery);
    context.queryClient.ensureQueryData(catsQuery);
    context.queryClient.ensureQueryData(archiveHighlightsQuery);
  },
  head: () => ({
    meta: [
      { title: "Academia HQ Blog" },
      { name: "description", content: "Latest education news, WAEC/JAMB/NECO updates, scholarships, teacher hub and career guidance across Nigeria and Africa." },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Home,
});

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const { data: cats } = useSuspenseQuery(catsQuery);
  const { data: archive } = useSuspenseQuery(archiveHighlightsQuery);

  const featured = (data.featured.length > 0 ? data.featured : data.latest).slice(0, 3);
  const shownIds = new Set(featured.map((p) => p.id));
  const latest = data.latest.filter((p) => !shownIds.has(p.id));

  const lead = featured[0];
  const secondary = featured.slice(1, 3);

  return (
    <div className="container-blog py-8">
      {/* Front-page masthead intro */}
      <div className="rule-double pb-6">
        <p className="kicker">Today's brief</p>
        <h1 className="mt-2 font-display text-3xl md:text-[2.75rem] font-bold tracking-tight leading-[1.05] max-w-2xl">
          Education news, exam updates &amp; opportunities for Nigeria and Africa.
        </h1>
      </div>

      <AdSlot format="leaderboard" className="hidden md:flex mt-8" />
      <AdSlot format="mobile-banner" className="md:hidden mt-8" />

      {/* Lead story + secondary picks */}
      {lead && (
        <section className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <PostCard post={lead} variant="hero" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {secondary.map((p) => (
              <Link key={p.id} to="/post/$slug" params={{ slug: p.slug }} className="group flex gap-4 border-b border-border/70 pb-4 last:border-0 last:pb-0 lg:border-b lg:pb-4 lg:last:border-b-0">
                {p.category && <div className="hidden sm:block w-1 self-stretch bg-accent" />}
                <div>
                  {p.category && <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{p.category.name}</div>}
                  <h3 className="mt-1 font-display text-base font-bold leading-snug group-hover:text-primary transition line-clamp-3">{p.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-12 grid gap-10 lg:grid-cols-[2.2fr_1fr]">
        <div className="space-y-12">
          {/* Archive */}
          {archive.length > 0 && (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-primary"><FolderDown className="h-4 w-4" /></span>
                  <h2 className="font-display text-lg font-bold tracking-tight">Archive — free downloads</h2>
                </div>
                <Link to="/archive" className="text-xs font-semibold text-primary hover:underline">Browse the archive →</Link>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Lesson notes, schemes of work, exam series, AI prompt formats and AI-class guides for teachers.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {ARCHIVE_CATEGORIES.map((c) => (
                  <Link
                    key={c.key}
                    to="/archive"
                    className="border border-border/60 px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary transition"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {archive.slice(0, 3).map((r) => <ArchiveCard key={r.id} item={r} />)}
              </div>
            </section>
          )}

          {/* Latest */}
          <section>
            <SectionHeader title="Latest posts" />
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {latest.slice(0, 9).map((p) => <PostCard key={p.id} post={p} />)}
            </div>
            {data.latest.length === 0 && <EmptyState />}
          </section>
        </div>

        <aside className="space-y-8">
          {/* Trending */}
          <div className="border border-border/70 bg-card">
            <div className="kicker px-5 pt-5">
              <TrendingUp className="h-3.5 w-3.5" /> Trending
            </div>
            <div className="mt-3 divide-y divide-border/60">
              {data.trending.slice(0, 5).map((p, i) => (
                <Link key={p.id} to="/post/$slug" params={{ slug: p.slug }} className="group flex gap-3 items-start px-5 py-3">
                  <span className="font-display flex-shrink-0 text-2xl font-bold leading-none text-border group-hover:text-primary/40 transition">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-sm font-semibold leading-snug group-hover:text-primary transition line-clamp-2">{p.title}</span>
                </Link>
              ))}
              {data.trending.length === 0 && <p className="px-5 py-4 text-sm text-muted-foreground">Popular stories will appear here.</p>}
            </div>
            <div className="h-2" />
          </div>

          <AdSlot format="large-rectangle" />
          <NewsletterCard />

          {/* Categories */}
          <div className="border border-border/70 bg-card p-5">
            <div className="kicker">Categories</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {cats.slice(0, 10).map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="border border-border/60 px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary transition"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b-2 border-foreground pb-3">
      {icon && <span className="text-primary">{icon}</span>}
      <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function NewsletterCard() {
  return (
    <div className="bg-primary text-primary-foreground p-6">
      <Mail className="h-6 w-6" />
      <div className="mt-3 font-display text-lg font-bold">The Academia HQ brief</div>
      <p className="mt-1 text-sm text-primary-foreground/85">Weekly exam alerts, scholarships and teacher tips.</p>
      <form className="mt-4 space-y-2" onSubmit={(e) => e.preventDefault()}>
        <Input type="email" placeholder="you@school.edu" required className="rounded-none bg-primary-foreground text-foreground" />
        <Button type="submit" variant="secondary" className="w-full rounded-none">Subscribe free</Button>
      </form>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 border border-dashed border-border p-12 text-center">
      <h3 className="font-display text-lg font-semibold">No published articles yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to your admin dashboard to publish the first story.</p>
      <Link to="/auth" className="inline-flex mt-4"><Button>Sign in to Admin</Button></Link>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Mail, Sparkles, TrendingUp, FolderDown } from "lucide-react";
import { listHomePosts, listCategories } from "@/lib/posts.functions";
import { listArchiveHighlights } from "@/lib/archive.functions";
import { ARCHIVE_CATEGORIES } from "@/lib/archive-categories";
import { PostCard } from "@/components/post-card";
import { ArchiveCard } from "@/routes/archive";
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

  const featured = (data.featured.length > 0 ? data.featured : data.latest).slice(0, 3);
  const shownIds = new Set(featured.map((p) => p.id));
  const latest = data.latest.filter((p) => !shownIds.has(p.id));

  return (
    <div className="container-blog py-10">
      {/* Simple page intro — no hero imagery */}
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Academia HQ Blog</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Education news, exam updates, scholarships and career guidance for Nigeria and Africa.</p>
      </div>

      <AdSlot format="leaderboard" className="hidden md:flex mt-8" />
      <AdSlot format="mobile-banner" className="md:hidden mt-8" />

      <div className="mt-10 grid gap-10 lg:grid-cols-[2.2fr_1fr]">
        <div className="space-y-12">
          {/* Featured */}
          {featured.length > 0 && (
            <section>
              <SectionHeader icon={<Sparkles className="h-4 w-4" />} title="Featured" />
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((p) => <PostCard key={p.id} post={p} />)}
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
          <div className="rounded-xl border border-border/60 bg-card">
            <div className="flex items-center gap-2 px-5 pt-5 text-xs font-bold uppercase tracking-wider text-primary">
              <TrendingUp className="h-3.5 w-3.5" /> Trending
            </div>
            <div className="mt-3 divide-y divide-border/60">
              {data.trending.slice(0, 5).map((p, i) => (
                <Link key={p.id} to="/post/$slug" params={{ slug: p.slug }} className="group flex gap-3 items-start px-5 py-3">
                  <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-primary/10 text-primary text-xs font-bold">{i + 1}</span>
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
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-primary">Categories</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {cats.slice(0, 10).map((c) => (
                <Link
                  key={c.id}
                  to="/category/$slug"
                  params={{ slug: c.slug }}
                  className="rounded-full border border-border/60 px-3 py-1 text-xs font-medium hover:border-primary hover:text-primary transition"
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
    <div className="flex items-center gap-2 border-b border-border/60 pb-3">
      {icon && <span className="text-primary">{icon}</span>}
      <h2 className="text-lg font-bold tracking-tight">{title}</h2>
    </div>
  );
}

function NewsletterCard() {
  return (
    <div className="rounded-xl bg-primary text-primary-foreground p-6">
      <Mail className="h-6 w-6" />
      <div className="mt-3 text-lg font-bold">The Academia HQ brief</div>
      <p className="mt-1 text-sm text-primary-foreground/85">Weekly exam alerts, scholarships and teacher tips.</p>
      <form className="mt-4 space-y-2" onSubmit={(e) => e.preventDefault()}>
        <Input type="email" placeholder="you@school.edu" required className="bg-primary-foreground text-foreground" />
        <Button type="submit" variant="secondary" className="w-full">Subscribe free</Button>
      </form>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-border p-12 text-center">
      <h3 className="text-lg font-semibold">No published articles yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to your admin dashboard to publish the first story.</p>
      <Link to="/auth" className="inline-flex mt-4"><Button>Sign in to Admin</Button></Link>
    </div>
  );
}

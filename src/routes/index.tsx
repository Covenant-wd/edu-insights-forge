import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Mail, Radio, TrendingUp } from "lucide-react";
import { listHomePosts, listCategories } from "@/lib/posts.functions";
import { PostCard, type PostSummary } from "@/components/post-card";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { timeAgo } from "@/lib/time-ago";

const homeQuery = queryOptions({
  queryKey: ["home"],
  queryFn: () => listHomePosts(),
});
const catsQuery = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
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
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const FALLBACK_IMG = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=70";

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const { data: cats } = useSuspenseQuery(catsQuery);

  const pool = data.featured.length > 0 ? data.featured : data.latest;
  const lead = pool[0] ?? data.latest[0];
  const headlines = pool.slice(1, 5).length > 0 ? pool.slice(1, 5) : data.latest.slice(1, 5);
  const rest = data.latest.filter((p) => p.id !== lead?.id && !headlines.some((h) => h.id === p.id));

  return (
    <div>
      {/* Breaking / ticker strip */}
      {data.latest.length > 0 && <BreakingTicker posts={data.latest.slice(0, 6)} />}

      <div className="container-blog mt-6">
        <AdSlot format="leaderboard" className="hidden md:flex" />
        <AdSlot format="mobile-banner" className="md:hidden" />
      </div>

      {/* Top stories: news-style lead + headline list */}
      {lead && (
        <section className="container-blog py-8">
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Link to="/post/$slug" params={{ slug: lead.slug }} className="group relative block overflow-hidden rounded-2xl shadow-hero">
              <img
                src={lead.cover_image || FALLBACK_IMG}
                alt={lead.title}
                width={1200}
                height={720}
                fetchPriority="high"
                className="h-[280px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[380px] md:h-[460px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-8 text-white">
                {lead.category && (
                  <span className="inline-flex items-center rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
                    {lead.category.name}
                  </span>
                )}
                <h1 className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tight leading-[1.1] max-w-3xl">{lead.title}</h1>
                {lead.excerpt && <p className="mt-2 max-w-2xl text-sm md:text-base text-white/85 line-clamp-2 hidden sm:block">{lead.excerpt}</p>}
                <div className="mt-3 flex items-center gap-3 text-xs text-white/75">
                  <span>{lead.author?.display_name ?? "Academia HQ"}</span>
                  <span>·</span>
                  <span>{timeAgo(lead.published_at)}</span>
                  {lead.read_minutes && (
                    <>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{lead.read_minutes} min read</span>
                    </>
                  )}
                </div>
              </div>
            </Link>

            <div className="flex flex-col divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
              <div className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-primary border-b border-border/60">More top stories</div>
              {headlines.map((p, i) => (
                <HeadlineRow key={p.id} post={p} index={i + 1} />
              ))}
              {headlines.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">More stories will appear here.</div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Latest news + sidebar with ads */}
      <section className="container-blog py-2 grid gap-10 lg:grid-cols-[2.2fr_1fr]">
        <div>
          <SectionHeader title="Latest news" subtitle="Fresh from the Academia HQ newsroom" />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.slice(0, 9).map((p) => <PostCard key={p.id} post={p} />)}
          </div>
          {data.latest.length === 0 && <EmptyState />}
        </div>
        <aside className="space-y-8">
          <AdSlot format="large-rectangle" />
          <div className="rounded-xl border border-border/60 bg-card">
            <div className="flex items-center gap-2 px-5 pt-5 text-xs font-bold uppercase tracking-wider text-primary">
              <TrendingUp className="h-3.5 w-3.5" /> Most read
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
          <NewsletterCard />
          <AdSlot format="rectangle" />
        </aside>
      </section>

      {/* Popular categories as colored tag strip */}
      <section className="container-blog py-14">
        <SectionHeader title="Explore by topic" subtitle="From WAEC to Career Development" />
        <div className="mt-6 flex flex-wrap gap-2.5">
          {cats.slice(0, 14).map((c, i) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5"
              style={categoryTagStyle(i)}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function BreakingTicker({ posts }: { posts: PostSummary[] }) {
  return (
    <div className="border-b border-border/60 bg-primary text-primary-foreground">
      <div className="container-blog flex items-center gap-3 py-2 overflow-hidden">
        <span className="inline-flex flex-shrink-0 items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground">
          <Radio className="h-3 w-3" /> Breaking
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex gap-10 whitespace-nowrap animate-[ticker_28s_linear_infinite] hover:[animation-play-state:paused]">
            {[...posts, ...posts].map((p, i) => (
              <Link key={`${p.id}-${i}`} to="/post/$slug" params={{ slug: p.slug }} className="text-sm font-medium text-primary-foreground/90 hover:text-primary-foreground hover:underline">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
    </div>
  );
}

function HeadlineRow({ post, index }: { post: PostSummary; index: number }) {
  return (
    <Link to="/post/$slug" params={{ slug: post.slug }} className="group flex gap-3 items-start px-4 py-3 hover:bg-muted/50 transition">
      <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md bg-secondary text-foreground/70 text-xs font-bold mt-0.5">{index}</span>
      <div className="min-w-0">
        {post.category && <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">{post.category.name}</div>}
        <div className="mt-0.5 text-sm font-semibold leading-snug group-hover:text-primary transition line-clamp-2">{post.title}</div>
        <div className="mt-1 text-xs text-muted-foreground">{timeAgo(post.published_at)}</div>
      </div>
    </Link>
  );
}

const TAG_HUES = [262, 74, 27, 150, 200, 320];
function categoryTagStyle(i: number) {
  const hue = TAG_HUES[i % TAG_HUES.length];
  return {
    color: `oklch(0.4 0.15 ${hue})`,
    borderColor: `oklch(0.75 0.1 ${hue})`,
    backgroundColor: `oklch(0.96 0.03 ${hue})`,
  } as React.CSSProperties;
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b-2 border-foreground pb-3">
      <div>
        <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground uppercase">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
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

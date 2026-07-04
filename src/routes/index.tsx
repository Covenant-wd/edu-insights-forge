import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Flame, Mail, Sparkles, TrendingUp } from "lucide-react";
import { listHomePosts, listCategories } from "@/lib/posts.functions";
import { PostCard } from "@/components/post-card";
import { AdSlot } from "@/components/ad-slot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import heroImg from "@/assets/hero-students.jpg";

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

function Home() {
  const { data } = useSuspenseQuery(homeQuery);
  const { data: cats } = useSuspenseQuery(catsQuery);

  const featured = data.featured[0] ?? data.latest[0];
  const featuredRest = (data.featured.length > 0 ? data.featured.slice(1) : data.latest.slice(1)).slice(0, 4);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container-blog py-10 md:py-14 grid gap-8 lg:grid-cols-[1.4fr_1fr] items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Academia HQ Insights
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.05]">
              Education news that <span className="text-primary">moves</span> Africa forward.
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Exam updates, scholarships, teacher resources and career guidance — trusted by students, parents and schools across Nigeria.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/category/$slug" params={{ slug: "education-news" }}>
                <Button size="lg">Read latest news <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </Link>
              <Link to="/category/$slug" params={{ slug: "scholarships" }}>
                <Button size="lg" variant="outline">Explore scholarships</Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src={heroImg}
              alt="Students learning together"
              width={1600}
              height={1024}
              fetchPriority="high"
              className="rounded-2xl shadow-hero aspect-[4/3] object-cover w-full"
            />
            <div className="absolute -bottom-4 -left-4 hidden md:block rounded-xl bg-background border border-border/60 shadow-card p-4 max-w-[220px]">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">Trending</div>
              <div className="mt-1 text-sm font-semibold">2026 JAMB registration guide</div>
            </div>
          </div>
        </div>
      </section>

      <div className="container-blog mt-10">
        <AdSlot format="leaderboard" className="hidden md:flex" />
        <AdSlot format="mobile-banner" className="md:hidden" />
      </div>

      {/* Featured */}
      {featured && (
        <section className="container-blog py-12">
          <SectionHeader icon={<Flame className="h-5 w-5" />} title="Editor's Picks" subtitle="Handpicked stories from our newsroom" />
          <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <PostCard post={featured} variant="hero" />
            <div className="grid gap-4">
              {featuredRest.map((p) => (
                <div key={p.id} className="p-4 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition">
                  <PostCard post={p} variant="compact" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trending + sidebar with ads */}
      <section className="container-blog py-6 grid gap-10 lg:grid-cols-[2.2fr_1fr]">
        <div>
          <SectionHeader icon={<TrendingUp className="h-5 w-5" />} title="Latest articles" subtitle="Fresh from Academia HQ" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {data.latest.slice(0, 8).map((p) => <PostCard key={p.id} post={p} />)}
          </div>
          {data.latest.length === 0 && <EmptyState />}
        </div>
        <aside className="space-y-8">
          <AdSlot format="large-rectangle" />
          <div className="rounded-xl border border-border/60 bg-card p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Most read</div>
            <div className="mt-4 space-y-4">
              {data.trending.slice(0, 5).map((p, i) => (
                <div key={p.id} className="flex gap-3 items-start">
                  <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-primary/10 text-primary text-sm font-bold">{i + 1}</span>
                  <PostCard post={p} variant="compact" />
                </div>
              ))}
              {data.trending.length === 0 && <p className="text-sm text-muted-foreground">Popular stories will appear here.</p>}
            </div>
          </div>
          <NewsletterCard />
          <AdSlot format="rectangle" />
        </aside>
      </section>

      {/* Popular categories */}
      <section className="container-blog py-14">
        <SectionHeader title="Explore by topic" subtitle="From WAEC to Career Development" />
        <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cats.slice(0, 12).map((c) => (
            <Link
              key={c.id}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="rounded-lg border border-border/60 bg-card px-4 py-3 text-center text-sm font-semibold hover:border-primary hover:text-primary transition"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ icon, title, subtitle }: { icon?: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border/60 pb-4">
      <div>
        <div className="inline-flex items-center gap-2 text-primary">
          {icon}
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h2>
        </div>
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

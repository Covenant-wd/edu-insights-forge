import { useEffect } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { trackPostView } from "@/lib/track-view";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Clock, Calendar } from "lucide-react";
import { ShareButtons } from "@/components/share-buttons";
import sanitizeHtml from "sanitize-html";
import { getPostBySlug } from "@/lib/posts.functions";
import { PostCard } from "@/components/post-card";
import { CommentsSection } from "@/components/comments-section";
import { AdSlot } from "@/components/ad-slot";
import { SITE_NAME, absoluteUrl } from "@/lib/site";

const postQuery = (slug: string) =>
  queryOptions({
    queryKey: ["post", slug],
    queryFn: () => getPostBySlug({ data: { slug } }),
  });

export const Route = createFileRoute("/post/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(postQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Article not found" }, { name: "robots", content: "noindex" }] };
    }
    const { post } = loaderData;
    const url = absoluteUrl(`/post/${params.slug}`);
    const cover = post.cover_image
      ? post.cover_image.startsWith("http")
        ? post.cover_image
        : absoluteUrl(post.cover_image)
      : null;
    return {
      meta: [
        { title: `${post.title} | ${SITE_NAME}` },
        { name: "description", content: post.excerpt ?? post.title },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.excerpt ?? post.title },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(post.category ? [{ property: "article:section", content: post.category.name }] : []),
        ...(post.published_at ? [{ property: "article:published_time", content: post.published_at }] : []),
        ...(post.updated_at ? [{ property: "article:modified_time", content: post.updated_at }] : []),
        ...(cover ? [{ property: "og:image", content: cover }, { name: "twitter:image", content: cover }] : []),
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: post.excerpt ?? post.title },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [{
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
          headline: post.title,
          description: post.excerpt,
          image: cover ? [cover] : undefined,
          datePublished: post.published_at,
          dateModified: post.updated_at,
          author: { "@type": "Person", name: post.author?.display_name ?? "Academia HQ" },
          publisher: { "@type": "Organization", name: "Academia HQ", logo: { "@type": "ImageObject", url: absoluteUrl("/favicon.ico") } },
        }),
      }],
    };
  },
  component: PostPage,
  notFoundComponent: () => (
    <div className="container-blog py-24 text-center">
      <h1 className="text-3xl font-bold">Article not found</h1>
      <Link to="/" className="mt-4 inline-block text-primary">← Back to homepage</Link>
    </div>
  ),
});

function PostPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(postQuery(slug));
  const postId = data?.post.id;
  useEffect(() => {
    if (postId) void trackPostView(postId);
  }, [postId]);
  if (!data) return null;
  const { post, related } = data;

  const published = post.published_at ? new Date(post.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

  return (
    <article>
      {/* Header + cover */}
      <div className="container-blog pt-8">
        <nav className="text-xs font-medium text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          {post.category && (<> <span className="mx-1">/</span> <Link to="/category/$slug" params={{ slug: post.category.slug }} className="hover:text-primary">{post.category.name}</Link></>)}
        </nav>
        <div className="mt-5 max-w-3xl">
          {post.category && <p className="kicker">{post.category.name}</p>}
          <h1 className="mt-3 font-display text-3xl md:text-5xl font-bold tracking-tight leading-[1.08]">{post.title}</h1>
          {post.excerpt && <p className="mt-4 font-serif text-lg text-muted-foreground italic">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border/70 pt-5 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt="" className="h-9 w-9 object-cover" />
              ) : (
                <span className="grid h-9 w-9 place-items-center border border-border bg-muted text-foreground text-sm font-bold">
                  {(post.author?.display_name ?? "A").charAt(0)}
                </span>
              )}
              <div>
                <div className="text-foreground font-semibold">{post.author?.display_name ?? "Academia HQ"}</div>
                <div className="text-xs">Editorial team</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" />{published}</span>
            <span className="inline-flex items-center gap-1"><Clock className="h-4 w-4" />{post.read_minutes} min read</span>
          </div>
        </div>
      </div>

      {post.cover_image && (
        <div className="container-blog mt-8">
          <img src={post.cover_image} alt={post.title} className="w-full max-h-[520px] object-cover shadow-hero" width={1600} height={900} />
        </div>
      )}

      <div className="container-blog mt-10 grid gap-12 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
        <div className="min-w-0">
          <AdSlot format="leaderboard" className="hidden md:flex mb-8" />
          <AdSlot format="mobile-banner" className="md:hidden mb-8" />
          <div className="prose-article" dangerouslySetInnerHTML={{ __html: renderContent(post.content) }} />
          <AdSlot format="large-rectangle" className="my-10" />

          <ShareButtons title={post.title} />

          {post.author?.bio && (
            <div className="mt-8 border border-border/60 bg-card p-6">
              <div className="flex items-center gap-3">
                {post.author.avatar_url && <img src={post.author.avatar_url} alt="" className="h-12 w-12 object-cover" />}
                <div>
                  <div className="kicker">Written by</div>
                  <div className="font-display font-bold">{post.author.display_name}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{post.author.bio}</p>
            </div>
          )}

          {/* Comments Section */}
          <CommentsSection postId={post.id} />
        </div>

        <aside className="space-y-8">
          <AdSlot format="large-rectangle" />
          <div className="border border-border/60 bg-card p-5">
            <div className="kicker">Newsletter</div>
            <p className="mt-2 text-sm text-muted-foreground">Get education updates delivered weekly.</p>
            <a href="#" className="mt-3 inline-block bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Subscribe</a>
          </div>
          <AdSlot format="sidebar" className="hidden lg:flex" />
        </aside>
      </div>

      {related.length > 0 && (
        <section className="container-blog py-16 border-t-2 border-foreground mt-16">
          <h2 className="font-display text-2xl font-bold">Related articles</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}
    </article>
  );
}

const SANITIZE_OPTS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "s", "code", "pre",
    "h2", "h3", "h4", "ul", "ol", "li", "blockquote", "a", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt"],
    "*": ["style", "class"],
  },
  allowedStyles: {
    "*": { "text-align": [/^left$|^center$|^right$|^justify$/] },
  },
  allowedSchemes: ["http", "https", "mailto"],
};

/**
 * Post content is rich-text HTML produced by the admin editor. Sanitize it
 * before injecting. Posts saved before the rich-text editor shipped still
 * hold plain markdown-lite text (no tags) — fall back to the small parser
 * below for those.
 */
function renderContent(raw: string): string {
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return sanitizeHtml(raw, SANITIZE_OPTS);
  }
  return renderMarkdownLite(raw);
}

function renderMarkdownLite(raw: string): string {
  const esc = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const blocks = esc.split(/\n{2,}/).map((block) => {
    const b = block.trim();
    if (!b) return "";
    if (b.startsWith("### ")) return `<h3>${b.slice(4)}</h3>`;
    if (b.startsWith("## ")) return `<h2>${b.slice(3)}</h2>`;
    if (b.startsWith("> ")) return `<blockquote>${b.slice(2)}</blockquote>`;
    if (/^[-*] /.test(b)) {
      const items = b.split(/\n/).map((l) => l.replace(/^[-*]\s+/, "").trim()).filter(Boolean);
      return `<ul>${items.map((i) => `<li>${inline(i)}</li>`).join("")}</ul>`;
    }
    return `<p>${inline(b).replace(/\n/g, "<br/>")}</p>`;
  });
  return blocks.join("\n");
}

function inline(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";

export type PostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  cover_image?: string | null;
  read_minutes?: number | null;
  published_at?: string | null;
  category?: { name: string; slug: string } | null;
  author?: { display_name?: string | null; avatar_url?: string | null } | null;
};

const FALLBACK = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=70";

function formatDate(d?: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PostCard({ post, variant = "default" }: { post: PostSummary; variant?: "default" | "compact" | "hero" }) {
  const img = post.cover_image || FALLBACK;

  if (variant === "compact") {
    return (
      <Link to="/post/$slug" params={{ slug: post.slug }} className="group flex gap-3 items-start">
        <img src={img} alt="" loading="lazy" className="h-16 w-20 flex-shrink-0 object-cover" />
        <div>
          {post.category && (
            <div className="text-[10px] font-bold uppercase tracking-wider text-primary">{post.category.name}</div>
          )}
          <div className="mt-0.5 font-display text-sm font-bold leading-snug group-hover:text-primary transition line-clamp-2">
            {post.title}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "hero") {
    return (
      <Link to="/post/$slug" params={{ slug: post.slug }} className="group relative block overflow-hidden shadow-hero">
        <img src={img} alt={post.title} className="h-[420px] w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-white">
          {post.category && (
            <span className="inline-flex items-center bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent-foreground">
              {post.category.name}
            </span>
          )}
          <h2 className="mt-3 font-display text-2xl md:text-4xl font-bold tracking-tight leading-tight max-w-3xl">{post.title}</h2>
          {post.excerpt && <p className="mt-2 max-w-2xl text-sm md:text-base text-white/85 line-clamp-2">{post.excerpt}</p>}
          <div className="mt-3 text-xs text-white/70 flex items-center gap-3">
            <span>{post.author?.display_name ?? "Academia HQ"}</span>
            <span>·</span>
            <span>{formatDate(post.published_at)}</span>
            {post.read_minutes && <><span>·</span><span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_minutes} min</span></>}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link to="/post/$slug" params={{ slug: post.slug }} className="group flex flex-col overflow-hidden border border-border/70 bg-card transition hover:border-primary/50 hover:shadow-lift">
      <div className="aspect-[16/10] overflow-hidden bg-muted">
        <img src={img} alt={post.title} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        {post.category && (
          <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{post.category.name}</div>
        )}
        <h3 className="font-display text-lg font-bold leading-snug tracking-tight group-hover:text-primary transition line-clamp-2">{post.title}</h3>
        {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>}
        <div className="mt-auto pt-2 flex items-center justify-between border-t border-border/60 text-xs text-muted-foreground">
          <span className="pt-2">{post.author?.display_name ?? "Academia HQ"}</span>
          <span className="pt-2 inline-flex items-center gap-1"><Clock className="h-3 w-3" />{post.read_minutes ?? 5} min</span>
        </div>
      </div>
    </Link>
  );
}

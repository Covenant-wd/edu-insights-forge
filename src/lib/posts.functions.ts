import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

const POST_SELECT =
  "id,title,slug,excerpt,cover_image,read_minutes,published_at,featured,view_count,category:categories(id,name,slug),author:profiles(id,display_name,avatar_url)";

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb.from("categories").select("*").order("sort_order");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listHomePosts = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [featured, latest, trending] = await Promise.all([
    sb.from("posts").select(POST_SELECT).eq("status", "published").eq("featured", true).order("published_at", { ascending: false }).limit(5),
    sb.from("posts").select(POST_SELECT).eq("status", "published").order("published_at", { ascending: false }).limit(12),
    sb.from("posts").select(POST_SELECT).eq("status", "published").order("view_count", { ascending: false }).limit(6),
  ]);
  if (featured.error) throw new Error(featured.error.message);
  if (latest.error) throw new Error(latest.error.message);
  if (trending.error) throw new Error(trending.error.message);
  return { featured: featured.data ?? [], latest: latest.data ?? [], trending: trending.data ?? [] };
});

export const getPostBySlug = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: post, error } = await sb
      .from("posts")
      .select("id,title,slug,excerpt,content,cover_image,read_minutes,published_at,updated_at,view_count,category:categories(id,name,slug),author:profiles(id,display_name,avatar_url,bio)")
      .eq("slug", data.slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return null;
    const { data: related } = await sb
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .neq("id", post.id)
      .eq("category_id", post.category?.id ?? "00000000-0000-0000-0000-000000000000")
      .order("published_at", { ascending: false })
      .limit(3);
    return { post, related: related ?? [] };
  });

export const listPostsByCategory = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: cat } = await sb.from("categories").select("*").eq("slug", data.slug).maybeSingle();
    if (!cat) return { category: null, posts: [] };
    const { data: posts, error } = await sb
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .eq("category_id", cat.id)
      .order("published_at", { ascending: false })
      .limit(24);
    if (error) throw new Error(error.message);
    return { category: cat, posts: posts ?? [] };
  });

export const searchPosts = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const term = `%${data.q.replace(/[%_]/g, "")}%`;
    const { data: posts, error } = await sb
      .from("posts")
      .select(POST_SELECT)
      .eq("status", "published")
      .or(`title.ilike.${term},excerpt.ilike.${term}`)
      .order("published_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return posts ?? [];
  });

export const listAllPublishedSlugs = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.from("posts").select("slug,updated_at").eq("status", "published");
  return data ?? [];
});

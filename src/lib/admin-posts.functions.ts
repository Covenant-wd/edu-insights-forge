import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const postSchema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(200).regex(/^[a-z0-9-]+$/, "lowercase, digits and dashes only"),
  excerpt: z.string().trim().max(500).optional().nullable(),
  content: z.string().min(1).max(200000),
  cover_image: z.string().trim().url().max(1000).optional().nullable().or(z.literal("")).catch(null),
  category_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  featured: z.boolean().default(false),
  read_minutes: z.number().int().min(1).max(120).default(5),
});

async function assertEditor(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: any) => r.role as string);
  const isAdmin = roles.includes("admin");
  const isEditor = isAdmin || roles.includes("editor");
  if (!isEditor) throw new Error("Forbidden: editor role required");
  return { isAdmin };
}

export const adminListPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertEditor(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("posts")
      .select("id,title,slug,status,featured,published_at,updated_at,category:categories(name)")
      .order("updated_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const adminGetPost = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { data: post, error } = await context.supabase.from("posts").select("*").eq("id", data.id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) throw new Error("Post not found");
    return post;
  });

export const adminUpsertPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => 
    z.object({ 
      id: z.string().uuid().nullable().optional(), 
      values: postSchema 
    }).parse(d)
  )
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    
    const payload: any = { ...data.values };
    
    // Clean up nullable fields
    if (payload.cover_image === "" || !payload.cover_image) payload.cover_image = null;
    if (!payload.category_id) payload.category_id = null;
    if (!payload.excerpt) payload.excerpt = null;
    
    // Set published_at timestamp for new published posts
    if (payload.status === "published" && !data.id) {
      payload.published_at = new Date().toISOString();
    }
    
    // Update existing post
    if (data.id) {
      const { data: existing, error: fetchError } = await context.supabase
        .from("posts")
        .select("published_at,status")
        .eq("id", data.id)
        .maybeSingle();
      
      if (fetchError) throw new Error(fetchError.message);
      if (!existing) throw new Error("Post not found");
      
      // Only set published_at if transitioning from draft to published
      if (existing.status !== "published" && payload.status === "published") {
        payload.published_at = new Date().toISOString();
      }
      
      const { error } = await context.supabase
        .from("posts")
        .update(payload)
        .eq("id", data.id);
      
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    
    // Create new post
    payload.author_id = context.userId;
    const { data: inserted, error } = await context.supabase
      .from("posts")
      .insert(payload)
      .select("id")
      .single();
    
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const adminDeletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { isAdmin } = await assertEditor(context.supabase, context.userId);
    if (!isAdmin) throw new Error("Forbidden: admin only");
    const { error } = await context.supabase.from("posts").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListCategories = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertEditor(context.supabase, context.userId);
    const { data } = await context.supabase.from("categories").select("*").order("sort_order");
    return data ?? [];
  });

export const getMyRoles = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("user_roles").select("role").eq("user_id", context.userId);
    return (data ?? []).map((r: any) => r.role as string);
  });

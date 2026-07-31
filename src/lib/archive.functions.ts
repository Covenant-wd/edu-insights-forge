import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function publicClient() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

async function assertEditor(supabase: any, userId: string) {
  const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: any) => r.role as string);
  if (!roles.includes("admin") && !roles.includes("editor")) throw new Error("Forbidden: editor only");
}

const SELECT = "id,title,slug,description,category,level,subject,file_url,file_type,file_size,download_count,featured,sort_order,created_at";

export const listArchive = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("archive_resources")
    .select(SELECT)
    .eq("status", "published")
    .order("sort_order")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const listArchiveHighlights = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data, error } = await sb
    .from("archive_resources")
    .select(SELECT)
    .eq("status", "published")
    .order("featured", { ascending: false })
    .order("sort_order")
    .limit(6);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const registerArchiveDownload = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: row } = await sb.from("archive_resources").select("download_count").eq("id", data.id).maybeSingle();
    if (!row) return { ok: false };
    return { ok: true, count: (row.download_count ?? 0) + 1 };
  });

export const adminListArchive = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertEditor(context.supabase, context.userId);
    const { data, error } = await context.supabase
      .from("archive_resources")
      .select("*")
      .order("sort_order")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSchema = z.object({
  id: z.string().uuid().nullable().optional(),
  title: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/, "lowercase letters, digits and dashes only"),
  description: z.string().max(2000).optional().nullable(),
  category: z.string().trim().min(1).max(60),
  level: z.string().max(80).optional().nullable(),
  subject: z.string().max(80).optional().nullable(),
  file_url: z.string().trim().max(2000).default(""),
  file_type: z.string().trim().max(20).default("PDF"),
  file_size: z.string().max(30).optional().nullable(),
  featured: z.boolean().default(false),
  status: z.enum(["published", "draft"]).default("published"),
  sort_order: z.number().int().min(0).max(9999).default(0),
});

export const adminUpsertArchive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => upsertSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { id, ...payload } = data;
    if (id) {
      const { error } = await context.supabase.from("archive_resources").update(payload).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: inserted, error } = await context.supabase
      .from("archive_resources")
      .insert({ ...payload, created_by: context.userId })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: inserted.id };
  });

export const adminDeleteArchive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertEditor(context.supabase, context.userId);
    const { error } = await context.supabase.from("archive_resources").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { getRequest } from "@tanstack/react-start/server";
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

/**
 * Resolve the caller's identity for a comment post without *requiring* one.
 * Signed-in visitors get their session (so the row is tied to their
 * user_id and RLS's "insert own" policy applies); anyone else falls
 * through as a guest and the anonymous insert policy applies instead.
 */
async function resolveOptionalUser() {
  const request = getRequest();
  const authHeader = request?.headers?.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.replace("Bearer ", "");
  if (token.split(".").length !== 3) return null;

  const sb = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    },
  );
  const { data, error } = await sb.auth.getClaims(token);
  if (error || !data?.claims?.sub) return null;
  return { supabase: sb, userId: data.claims.sub as string, claims: data.claims as Record<string, any> };
}

export const listComments = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ postId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("comments")
      .select("id,post_id,user_id,author_name,content,created_at")
      .eq("post_id", data.postId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const addComment = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({
      postId: z.string().uuid(),
      content: z.string().trim().min(2).max(2000),
      guestName: z.string().trim().max(60).optional(),
      guestEmail: z.string().trim().max(200).optional(),
      // Honeypot — real visitors never fill this hidden field in.
      website: z.string().max(0).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    if (data.website) return { ok: true }; // silently drop bot submissions

    const session = await resolveOptionalUser();

    if (session) {
      const { data: profile } = await session.supabase
        .from("profiles")
        .select("display_name")
        .eq("id", session.userId)
        .maybeSingle();

      const fallback =
        (session.claims["user_metadata"]?.["full_name"] as string | undefined) ??
        (typeof session.claims["email"] === "string" ? (session.claims["email"] as string).split("@")[0] : undefined);

      const { error } = await session.supabase.from("comments").insert({
        post_id: data.postId,
        user_id: session.userId,
        content: data.content,
        author_name: profile?.display_name || fallback || "Reader",
      });
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const guestName = data.guestName?.trim();
    if (!guestName || guestName.length < 2) {
      throw new Error("Please enter your name to comment.");
    }
    if (data.guestEmail && !/^\S+@\S+\.\S+$/.test(data.guestEmail)) {
      throw new Error("That email address doesn't look right.");
    }

    const sb = publicClient();
    const { error } = await sb.from("comments").insert({
      post_id: data.postId,
      user_id: null,
      content: data.content,
      author_name: guestName,
      guest_email: data.guestEmail || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("comments").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const myComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("comments")
      .select("id,content,created_at,post_id,posts(title,slug)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

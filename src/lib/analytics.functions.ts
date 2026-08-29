import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type DailyTraffic = { day: string; views: number; visitors: number };
export type PostViewRow = {
  post_id: string;
  title: string;
  slug: string;
  status: string;
  total_views: number;
  recent_views: number;
  today_views: number;
};

export const adminDailyTraffic = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ days: z.number().int().min(1).max(180).default(30) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await (context.supabase as any).rpc("admin_daily_traffic", { _days: data.days });
    if (error) throw new Error(error.message);
    return (rows ?? []) as DailyTraffic[];
  });

export const adminPostViews = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ days: z.number().int().min(1).max(180).default(7) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await (context.supabase as any).rpc("admin_post_views", { _days: data.days });
    if (error) throw new Error(error.message);
    return (rows ?? []) as PostViewRow[];
  });

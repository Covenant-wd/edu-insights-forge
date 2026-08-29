import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Eye, Users, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { adminDailyTraffic, adminPostViews } from "@/lib/analytics.functions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({ meta: [{ title: "Academia HQ Blog" }, { name: "robots", content: "noindex" }] }),
  component: AdminAnalytics,
});

const RANGES = [7, 14, 30, 90];

function AdminAnalytics() {
  const [days, setDays] = useState(30);

  const traffic = useQuery({
    queryKey: ["admin-traffic", days],
    queryFn: () => adminDailyTraffic({ data: { days } }),
  });
  const posts = useQuery({
    queryKey: ["admin-post-views", days],
    queryFn: () => adminPostViews({ data: { days } }),
  });

  const rows = traffic.data ?? [];
  const today = rows[rows.length - 1];
  const yesterday = rows[rows.length - 2];
  const totalViews = rows.reduce((s, r) => s + Number(r.views), 0);
  const peak = rows.reduce((m, r) => Math.max(m, Number(r.views)), 0);
  const delta = today && yesterday ? Number(today.views) - Number(yesterday.views) : 0;

  const chartData = rows.map((r) => ({
    day: new Date(r.day).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
    views: Number(r.views),
    visitors: Number(r.visitors),
  }));

  return (
    <div className="container-blog py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Audience analytics</h1>
          <p className="text-sm text-muted-foreground">Article views, daily gains and unique visitors.</p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((d) => (
            <Button key={d} size="sm" variant={d === days ? "default" : "outline"} onClick={() => setDays(d)}>
              {d}d
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Eye className="h-4 w-4" />} label="Views today" value={today ? Number(today.views) : 0} />
        <StatCard icon={<Users className="h-4 w-4" />} label="Visitors today" value={today ? Number(today.visitors) : 0} />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Change vs yesterday"
          value={`${delta > 0 ? "+" : ""}${delta}`}
        />
        <StatCard icon={<Eye className="h-4 w-4" />} label={`Views last ${days} days`} value={totalViews} />
      </div>

      <div className="mt-8 rounded-xl border border-border/60 bg-card p-5">
        <h2 className="font-display text-lg font-bold">Daily views &amp; visitors</h2>
        {traffic.isLoading ? (
          <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>
        ) : peak === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            No views recorded yet in this period. Data starts collecting as readers open articles.
          </p>
        ) : (
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ left: -20, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="views" stroke="hsl(var(--primary))" fill="url(#gv)" strokeWidth={2} />
                <Area type="monotone" dataKey="visitors" stroke="hsl(var(--accent))" fill="none" strokeWidth={2} strokeDasharray="4 3" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Article</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Today</th>
              <th className="px-4 py-3 text-right">Last {days}d</th>
              <th className="px-4 py-3 text-right">Total views</th>
            </tr>
          </thead>
          <tbody>
            {posts.data?.map((p) => (
              <tr key={p.post_id} className="border-t border-border/60">
                <td className="px-4 py-3 font-semibold">
                  <Link to="/post/$slug" params={{ slug: p.slug }} className="hover:text-primary">{p.title}</Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">{Number(p.today_views)}</td>
                <td className="px-4 py-3 text-right">{Number(p.recent_views)}</td>
                <td className="px-4 py-3 text-right font-bold">{Number(p.total_views)}</td>
              </tr>
            ))}
            {posts.data?.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">No articles yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

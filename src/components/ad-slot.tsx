import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { RawAdMarkup } from "@/components/raw-ad-markup";
import { listEnabledSnippets } from "@/lib/ads.functions";

type Format = "leaderboard" | "rectangle" | "large-rectangle" | "mobile-banner" | "sidebar";

const SIZES: Record<Format, { w: number; h: number; label: string; zoneKey: string }> = {
  leaderboard: { w: 728, h: 90, label: "728 × 90", zoneKey: "banner_leaderboard" },
  rectangle: { w: 300, h: 250, label: "300 × 250", zoneKey: "banner_rectangle" },
  "large-rectangle": { w: 336, h: 280, label: "336 × 280", zoneKey: "banner_large_rectangle" },
  "mobile-banner": { w: 320, h: 100, label: "320 × 100", zoneKey: "banner_mobile_banner" },
  sidebar: { w: 300, h: 600, label: "300 × 600", zoneKey: "banner_sidebar" },
};

/**
 * Renders a Monetag banner placement. The actual snippet code is fetched
 * from the ad_snippets table (managed at /admin/ads); this component just
 * looks up the code by zone_key based on the format prop. When no code is
 * configured, a dashed dev placeholder is shown instead.
 */
export function AdSlot({ format = "rectangle", className, sticky }: { format?: Format; className?: string; sticky?: boolean }) {
  const s = SIZES[format];
  const { data } = useQuery({
    queryKey: ["ad-snippets-enabled"],
    queryFn: () => listEnabledSnippets(),
    staleTime: 5 * 60 * 1000,
  });

  const findCode = (key: string) => data?.find((r) => r.zone_key === key)?.code?.trim();
  // Mobile banner falls back to the leaderboard code so phones still show
  // a banner even when only the 728x90 zone is configured.
  const code = findCode(s.zoneKey) ?? (format === "mobile-banner" ? findCode("banner_leaderboard") : undefined);

  if (code) {
    return (
      <div
        className={cn("mx-auto max-w-full overflow-hidden", sticky && "sticky top-24", className)}
        style={{ maxWidth: `min(${s.w}px, 100%)`, minHeight: s.h }}
        data-ad-slot={format}
      >
        <RawAdMarkup html={code} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto flex w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-[11px] uppercase tracking-widest text-muted-foreground",
        sticky && "sticky top-24",
        className,
      )}
      style={{ maxWidth: `min(${s.w}px, 100%)`, aspectRatio: `${s.w} / ${s.h}` }}
      data-ad-slot={format}
      aria-label="Advertisement"
    >
      Advertisement · {s.label}
    </div>
  );
}

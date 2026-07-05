import { cn } from "@/lib/utils";
import { RawAdMarkup } from "@/components/raw-ad-markup";

type Format = "leaderboard" | "rectangle" | "large-rectangle" | "mobile-banner" | "sidebar";

const SIZES: Record<Format, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90, label: "728 × 90" },
  rectangle: { w: 300, h: 250, label: "300 × 250" },
  "large-rectangle": { w: 336, h: 280, label: "336 × 280" },
  "mobile-banner": { w: 320, h: 100, label: "320 × 100" },
  sidebar: { w: 300, h: 600, label: "300 × 600" },
};

/**
 * MONETAG SETUP
 * 1. In your Monetag dashboard: Sites → your site → Add zone → "Banner".
 * 2. Create one zone per placement below (e.g. "Homepage leaderboard",
 *    "Sidebar rectangle") and click "Get tag" on each.
 * 3. Paste each zone's raw code (HTML + <script>) as the string value here,
 *    matching the size you picked in Monetag to the `format` key below.
 *
 * Leave a slot as "" to keep showing the dashed dev placeholder for it.
 */
const MONETAG_BANNER_CODE: Partial<Record<Format, string>> = {
  leaderboard: "",
  rectangle: "",
  "large-rectangle": "",
  "mobile-banner": "",
  sidebar: "",
};

export function AdSlot({ format = "rectangle", className, sticky }: { format?: Format; className?: string; sticky?: boolean }) {
  const s = SIZES[format];
  const code = MONETAG_BANNER_CODE[format];

  if (code) {
    return (
      <div
        className={cn("mx-auto overflow-hidden", sticky && "sticky top-24", className)}
        style={{ maxWidth: s.w }}
        data-ad-slot={format}
      >
        <RawAdMarkup html={code} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mx-auto flex items-center justify-center rounded-lg border border-dashed border-border bg-muted/40 text-[11px] uppercase tracking-widest text-muted-foreground",
        sticky && "sticky top-24",
        className,
      )}
      style={{ maxWidth: s.w, aspectRatio: `${s.w} / ${s.h}` }}
      data-ad-slot={format}
      aria-label="Advertisement"
    >
      Advertisement · {s.label}
    </div>
  );
}

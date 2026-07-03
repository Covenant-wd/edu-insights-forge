import { cn } from "@/lib/utils";

type Format = "leaderboard" | "rectangle" | "large-rectangle" | "mobile-banner" | "sidebar";

const SIZES: Record<Format, { w: number; h: number; label: string }> = {
  leaderboard: { w: 728, h: 90, label: "728 × 90" },
  rectangle: { w: 300, h: 250, label: "300 × 250" },
  "large-rectangle": { w: 336, h: 280, label: "336 × 280" },
  "mobile-banner": { w: 320, h: 100, label: "320 × 100" },
  sidebar: { w: 300, h: 600, label: "300 × 600" },
};

/** Placeholder ad slot ready for AdSense / Monetag / Adsterra. Replace inner content with the network's tag. */
export function AdSlot({ format = "rectangle", className, sticky }: { format?: Format; className?: string; sticky?: boolean }) {
  const s = SIZES[format];
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

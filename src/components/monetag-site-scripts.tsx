import { useQuery } from "@tanstack/react-query";
import { listEnabledSnippets } from "@/lib/ads.functions";
import { RawAdMarkup } from "@/components/raw-ad-markup";

/**
 * Injects site-wide Monetag ad snippets (Multitag, Popunder, Push,
 * In-Page Push, Vignette) that admins configure at /admin/ads. Runs
 * client-side so admins can edit codes without a redeploy.
 */
export function MonetagSiteScripts() {
  const { data } = useQuery({
    queryKey: ["ad-snippets-enabled"],
    queryFn: () => listEnabledSnippets(),
    staleTime: 5 * 60 * 1000,
  });

  if (!data?.length) return null;

  return (
    <div aria-hidden className="hidden">
      {data.map((s) => (
        <RawAdMarkup key={s.zone_key} html={s.code} />
      ))}
    </div>
  );
}

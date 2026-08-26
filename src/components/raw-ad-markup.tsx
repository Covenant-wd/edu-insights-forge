import { useEffect, useRef } from "react";

/**
 * Injects a raw ad-network snippet (HTML + <script> tags) into the DOM.
 *
 * Why this exists: dangerouslySetInnerHTML / a plain innerHTML assignment
 * never executes <script> tags, for security reasons — but ad networks
 * like Monetag give you a snippet that includes one, and different ad
 * formats (leaderboard vs. mobile banner, etc.) often wrap that script
 * inside a container <div> rather than pasting it bare at the top level.
 * This walks the *entire* injected tree — not just its direct children —
 * and recreates every <script> node found anywhere in it, however deeply
 * nested, so the browser actually runs it.
 */
export function RawAdMarkup({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !html) return;

    el.innerHTML = html;

    Array.from(el.querySelectorAll("script")).forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
      newScript.text = oldScript.text;
      oldScript.replaceWith(newScript);
    });

    return () => {
      el.innerHTML = "";
    };
  }, [html]);

  return <div ref={ref} className={className} />;
}

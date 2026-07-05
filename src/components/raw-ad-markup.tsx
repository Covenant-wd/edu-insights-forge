import { useEffect, useRef } from "react";

/**
 * Injects a raw ad-network snippet (HTML + <script> tags) into the DOM.
 *
 * Why this exists: dangerouslySetInnerHTML does NOT execute <script> tags
 * for security reasons, but ad networks like Monetag give you a snippet
 * that includes one. This recreates each <script> as a real DOM node so
 * the browser actually runs it.
 */
export function RawAdMarkup({ html, className }: { html: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !html) return;
    el.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    // Move over non-script nodes as-is, and recreate <script> nodes so they execute.
    Array.from(wrapper.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const oldScript = node as HTMLScriptElement;
        const newScript = document.createElement("script");
        Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
        newScript.text = oldScript.text;
        el.appendChild(newScript);
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });

    return () => {
      el.innerHTML = "";
    };
  }, [html]);

  return <div ref={ref} className={className} />;
}

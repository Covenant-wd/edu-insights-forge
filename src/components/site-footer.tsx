import { Link } from "@tanstack/react-router";
import { GraduationCap, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { to: "/category/education-news", label: "Education News" },
      { to: "/category/scholarships", label: "Scholarships" },
      { to: "/category/waec", label: "WAEC" },
      { to: "/category/jamb", label: "JAMB" },
      { to: "/category/university-news", label: "Universities" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About Academia HQ" },
      { to: "/contact", label: "Contact" },
      { to: "/write-for-us", label: "Write for us" },
      { to: "/advertise", label: "Advertise" },
      { to: "/editorial-policy", label: "Editorial policy" },
    ],
  },
  {
    title: "Legal",
    links: [
      { to: "/privacy", label: "Privacy Policy" },
      { to: "/cookies", label: "Cookie Policy" },
      { to: "/terms", label: "Terms of Service" },
      { to: "/disclaimer", label: "Disclaimer" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="rule-double mt-24 bg-secondary/40">
      <div className="container-blog py-16 grid gap-12 lg:grid-cols-[1.4fr_2fr_1.2fr]">
        <div>
          <Link to="/" className="flex items-baseline gap-2">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6 text-primary" strokeWidth={2.25} />
              <span className="font-display text-xl font-bold">Academia<span className="text-primary">HQ</span></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Blog</span>
          </Link>
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Trusted education news, exam updates, scholarships and teacher resources for students, parents and educators across Africa.
          </p>
          <div className="mt-5 flex gap-2">
            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
              <a key={i} href="#" aria-label="Social" className="grid h-9 w-9 place-items-center border border-border/70 hover:border-primary hover:text-primary transition">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <div className="kicker">{col.title}</div>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l.to}>
                    <a href={l.to} className="text-sm hover:text-primary transition">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div>
          <div className="kicker">Newsletter</div>
          <p className="mt-4 text-sm text-muted-foreground">Weekly education updates in your inbox.</p>
          <form className="mt-3 flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <Input type="email" placeholder="you@school.edu" required className="rounded-none" />
            <Button type="submit" className="rounded-none">Join</Button>
          </form>
        </div>
      </div>
      <div className="border-t border-border/60">
        <div className="container-blog py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Academia HQ Blog. All rights reserved.</p>
          <p>Built for students, teachers, and schools across Nigeria and Africa.</p>
        </div>
      </div>
    </footer>
  );
}

import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Moon, Search, Sun, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { getMyRoles } from "@/lib/admin-posts.functions";

const NAV = [
  { to: "/category/$slug", params: { slug: "education-news" }, label: "News" },
  { to: "/category/$slug", params: { slug: "waec" }, label: "WAEC" },
  { to: "/category/$slug", params: { slug: "jamb" }, label: "JAMB" },
  { to: "/category/$slug", params: { slug: "scholarships" }, label: "Scholarships" },
  { to: "/category/$slug", params: { slug: "teacher-hub" }, label: "Teachers" },
  { to: "/category/$slug", params: { slug: "career-development" }, label: "Careers" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const [dark, setDark] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initial = document.documentElement.classList.contains("dark") ||
      (typeof localStorage !== "undefined" && localStorage.getItem("theme") === "dark");
    if (initial) document.documentElement.classList.add("dark");
    setDark(initial);
    
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(!!data.session);
      if (data.session) {
        getMyRoles().then((roles) => {
          setIsAdmin(roles?.some((r: string) => r === "admin" || r === "editor") ?? false);
        }).catch(() => setIsAdmin(false));
      }
    });
    
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSignedIn(!!s);
      if (s) {
        getMyRoles().then((roles) => {
          setIsAdmin(roles?.some((r: string) => r === "admin" || r === "editor") ?? false);
        }).catch(() => setIsAdmin(false));
      } else {
        setIsAdmin(false);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    if (typeof localStorage !== "undefined") localStorage.setItem("theme", next ? "dark" : "light");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      navigate({ to: "/search", search: { q: q.trim() } });
      setSearchOpen(false);
      setOpen(false);
    }
  };

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-md">
      {/* Utility strip */}
      <div className="hidden border-b border-border/70 sm:block">
        <div className="container-blog flex h-9 items-center justify-between text-[11px] font-medium text-muted-foreground">
          <span>{today}</span>
          <span className="hidden md:inline">Education news, exam updates &amp; career guidance for Nigeria and Africa</span>
        </div>
      </div>

      {/* Masthead */}
      <div className="container-blog flex items-center gap-4 py-5">
        <Link to="/" className="flex items-center gap-2.5">
          <GraduationCap className="h-7 w-7 text-primary" strokeWidth={2.25} />
          <span className="font-display text-[1.65rem] font-bold leading-none tracking-tight">
            Academia<span className="text-primary">HQ</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen((v) => !v)} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle theme">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {signedIn ? (
            <Link to={isAdmin ? "/admin" : "/account"} className="hidden md:inline-flex">
              <Button size="sm" variant="secondary">{isAdmin ? "Admin dashboard" : "My account"}</Button>
            </Link>
          ) : (
            <Link to="/auth" className="hidden md:inline-flex">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Section nav, double-ruled like a print masthead */}
      <nav className="rule-double hidden lg:block">
        <div className="container-blog flex h-11 items-center gap-1">
          <Link
            to="/archive"
            className="px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition"
            activeProps={{ className: "text-primary" }}
          >
            Archive
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              params={item.params}
              className="px-3 py-2 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <div className="border-b border-border/70 lg:hidden" />

      {searchOpen && (
        <div className="border-b border-border/70 bg-background">
          <form onSubmit={submit} className="container-blog flex items-center gap-2 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles, exams, scholarships..." className="border-0 focus-visible:ring-0 shadow-none" />
            <Button type="submit" size="sm">Search</Button>
          </form>
        </div>
      )}

      {open && (
        <div className="lg:hidden border-b border-border/70 bg-background">
          <div className="container-blog py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link key={item.label} to={item.to} params={item.params} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                {item.label}
              </Link>
            ))}
            <Link to="/archive" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              Archive
            </Link>
            <Link to={signedIn ? (isAdmin ? "/admin" : "/account") : "/auth"} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-primary">
              {signedIn ? (isAdmin ? "Admin dashboard" : "My account") : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

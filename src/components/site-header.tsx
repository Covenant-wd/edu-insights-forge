import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, Moon, Search, Sun, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
  const navigate = useNavigate();

  useEffect(() => {
    const initial = document.documentElement.classList.contains("dark") ||
      (typeof localStorage !== "undefined" && localStorage.getItem("theme") === "dark");
    if (initial) document.documentElement.classList.add("dark");
    setDark(initial);
    supabase.auth.getSession().then(({ data }) => setSignedIn(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSignedIn(!!s));
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

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="container-blog flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </span>
          <span className="hidden sm:inline">Academia<span className="text-primary"> HQ</span></span>
        </Link>

        <nav className="ml-4 hidden lg:flex items-center gap-1">
          <Link
            to="/archive"
            className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
            activeProps={{ className: "text-primary" }}
          >
            Archive
          </Link>
          {NAV.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              params={item.params}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
              activeProps={{ className: "text-primary" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen((v) => !v)} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleDark} aria-label="Toggle theme">
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {signedIn ? (
            <Link to="/admin" className="hidden md:inline-flex">
              <Button size="sm" variant="secondary">Dashboard</Button>
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

      {searchOpen && (
        <div className="border-t border-border/60 bg-background">
          <form onSubmit={submit} className="container-blog flex items-center gap-2 py-3">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search articles, exams, scholarships..." className="border-0 focus-visible:ring-0 shadow-none" />
            <Button type="submit" size="sm">Search</Button>
          </form>
        </div>
      )}

      {open && (
        <div className="lg:hidden border-t border-border/60 bg-background">
          <div className="container-blog py-4 flex flex-col gap-1">
            {NAV.map((item) => (
              <Link key={item.label} to={item.to} params={item.params} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
                {item.label}
              </Link>
            ))}
            <Link to="/archive" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted">
              Archive
            </Link>
            <Link to={signedIn ? "/admin" : "/auth"} onClick={() => setOpen(false)} className="rounded-md px-3 py-2 text-sm font-semibold text-primary">
              {signedIn ? "Dashboard" : "Sign in"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderDown, LogOut, MessageCircle, ShieldCheck } from "lucide-react";
import { myComments } from "@/lib/comments.functions";
import { getMyRoles } from "@/lib/admin-posts.functions";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "Academia HQ Blog" }, { name: "robots", content: "noindex" }] }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useSession();
  const roles = useQuery({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });
  const comments = useQuery({ queryKey: ["my-comments"], queryFn: () => myComments() });
  const isStaff = roles.data?.some((r) => r === "admin" || r === "editor");

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="container-blog py-10">
      <div className="neu p-7">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary text-xl font-bold">
            {(user?.email ?? "R").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">My account</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            {isStaff && (
              <Link to="/admin"><Button variant="secondary"><ShieldCheck className="mr-1.5 h-4 w-4" />Admin dashboard</Button></Link>
            )}
            <Button variant="outline" onClick={signOut}><LogOut className="mr-1.5 h-4 w-4" />Sign out</Button>
          </div>
        </div>
        <p className="mt-5 text-sm text-muted-foreground">
          As a member you can comment on articles and download every resource in the archive. Publishing and site settings are reserved for
          the Academia HQ editorial team.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="neu p-6">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            <h2 className="font-bold tracking-tight">My comments</h2>
          </div>
          <div className="mt-4 space-y-3">
            {(comments.data ?? []).map((c: any) => (
              <div key={c.id} className="neu-inset p-4">
                <div className="text-xs text-muted-foreground">
                  {c.posts?.slug ? (
                    <Link to="/post/$slug" params={{ slug: c.posts.slug }} className="font-semibold text-primary hover:underline">
                      {c.posts.title}
                    </Link>
                  ) : "Article"}
                  {" · "}{new Date(c.created_at).toLocaleDateString()}
                </div>
                <p className="mt-1.5 text-sm">{c.content}</p>
              </div>
            ))}
            {comments.isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
            {!comments.isLoading && (comments.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">You haven’t commented yet. Open an article and share your view.</p>
            )}
          </div>
        </div>

        <div className="neu p-6 h-fit">
          <div className="flex items-center gap-2">
            <FolderDown className="h-4 w-4 text-primary" />
            <h2 className="font-bold tracking-tight">Archive downloads</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Lesson notes, schemes of work, exam series and AI guides — free for signed-in members.
          </p>
          <Link to="/archive" className="mt-4 inline-flex"><Button className="w-full">Browse the archive</Button></Link>
        </div>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, LogOut, Pencil, Trash2 } from "lucide-react";
import { adminListPosts, adminDeletePost, getMyRoles } from "@/lib/admin-posts.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Dashboard — Academia HQ" }, { name: "robots", content: "noindex" }] }),
  component: AdminHome,
});

function AdminHome() {
  const navigate = useNavigate();
  const roles = useQuery({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });
  const isEditor = roles.data?.some((r) => r === "admin" || r === "editor");

  const posts = useQuery({
    queryKey: ["admin-posts"],
    queryFn: () => adminListPosts(),
    enabled: isEditor === true,
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      await adminDeletePost({ data: { id } });
      toast.success("Deleted");
      posts.refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  if (roles.isLoading) return <div className="container-blog py-12">Loading…</div>;

  if (isEditor === false) {
    return (
      <div className="container-blog py-16 max-w-xl">
        <h1 className="text-2xl font-bold">Editor access required</h1>
        <p className="mt-2 text-muted-foreground">
          Your account is signed in but does not yet have editor or admin privileges. Ask an existing admin to grant you a role, or the first
          signed-in user can be promoted by running an SQL insert into <code>user_roles</code>.
        </p>
        <Button className="mt-4" variant="outline" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
      </div>
    );
  }

  return (
    <div className="container-blog py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage articles for Academia HQ.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/new"><Button><Plus className="mr-1.5 h-4 w-4" />New post</Button></Link>
          <Button variant="outline" onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign out</Button>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 hidden md:table-cell">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden lg:table-cell">Updated</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.data?.map((p: any) => (
              <tr key={p.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-semibold">{p.title}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">{p.category?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "published" ? "default" : "secondary"}>{p.status}</Badge>
                  {p.featured && <Badge className="ml-1" variant="outline">featured</Badge>}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">{new Date(p.updated_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Link to="/admin/$id/edit" params={{ id: p.id }}>
                      <Button size="sm" variant="outline"><Pencil className="h-3.5 w-3.5" /></Button>
                    </Link>
                    <Button size="sm" variant="outline" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {posts.data?.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">No posts yet. Create your first article.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { adminGetPost } from "@/lib/admin-posts.functions";
import PostEditor from "@/components/post-editor";

export const Route = createFileRoute("/_authenticated/admin/$id/edit")({
  head: () => ({ meta: [{ title: "Edit post — Academia HQ" }, { name: "robots", content: "noindex" }] }),
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-post", id],
    queryFn: () => adminGetPost({ data: { id } }),
  });
  if (isLoading) return <div className="container-blog py-12">Loading…</div>;
  if (!data) return <div className="container-blog py-12">Not found</div>;
  return <PostEditor initial={data} onSaved={() => navigate({ to: "/admin" })} />;
}

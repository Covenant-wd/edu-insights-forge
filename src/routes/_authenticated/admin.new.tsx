import { createFileRoute, useNavigate } from "@tanstack/react-router";
import PostEditor from "@/components/post-editor";

export const Route = createFileRoute("/_authenticated/admin/new")({
  head: () => ({ meta: [{ title: "New post — Academia HQ" }, { name: "robots", content: "noindex" }] }),
  component: NewPost,
});

function NewPost() {
  const navigate = useNavigate();
  return <PostEditor onSaved={() => navigate({ to: "/admin" })} />;
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addComment, deleteComment, listComments } from "@/lib/comments.functions";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function CommentsSection({ postId }: { postId: string }) {
  const { user, signedIn } = useSession();
  const qc = useQueryClient();
  const [text, setText] = useState("");

  const comments = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => listComments({ data: { postId } }),
  });

  const post = useMutation({
    mutationFn: () => addComment({ data: { postId, content: text.trim() } }),
    onSuccess: () => {
      setText("");
      toast.success("Comment posted");
      qc.invalidateQueries({ queryKey: ["comments", postId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not post comment"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteComment({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["comments", postId] }),
    onError: (e: any) => toast.error(e?.message ?? "Could not delete"),
  });

  const list = comments.data ?? [];

  return (
    <section className="mt-12">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-4 w-4 text-primary" />
        <h2 className="text-lg font-bold tracking-tight">
          Discussion {list.length > 0 && <span className="text-muted-foreground font-medium">({list.length})</span>}
        </h2>
      </div>

      {signedIn ? (
        <form
          className="mt-4 neu p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (text.trim().length < 2) return;
            post.mutate();
          }}
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts, tips or questions…"
            rows={4}
            maxLength={2000}
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="text-xs text-muted-foreground">Be kind and stay on topic.</span>
            <Button type="submit" disabled={post.isPending || text.trim().length < 2}>
              {post.isPending ? "Posting…" : "Post comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="mt-4 neu-inset p-6 text-center">
          <p className="text-sm text-muted-foreground">Sign in to join the discussion and download archive resources.</p>
          <Link to="/auth" className="mt-3 inline-flex"><Button>Sign in to comment</Button></Link>
        </div>
      )}

      <div className="mt-6 space-y-4">
        {list.map((c: any) => (
          <div key={c.id} className="neu-sm p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                {(c.author_name ?? "R").slice(0, 1).toUpperCase()}
              </span>
              <div>
                <div className="text-sm font-semibold">{c.author_name}</div>
                <div className="text-xs text-muted-foreground">{new Date(c.created_at).toLocaleString()}</div>
              </div>
              {user?.id === c.user_id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="ml-auto"
                  onClick={() => remove.mutate(c.id)}
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">{c.content}</p>
          </div>
        ))}
        {!comments.isLoading && list.length === 0 && (
          <p className="text-sm text-muted-foreground">No comments yet — be the first to share your thoughts.</p>
        )}
      </div>
    </section>
  );
}

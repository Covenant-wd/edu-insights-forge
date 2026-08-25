import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { addComment, deleteComment, listComments } from "@/lib/comments.functions";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export function CommentsSection({ postId }: { postId: string }) {
  const { user, signedIn } = useSession();
  const qc = useQueryClient();
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — must stay empty

  const comments = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => listComments({ data: { postId } }),
  });

  const post = useMutation({
    mutationFn: () =>
      addComment({
        data: {
          postId,
          content: text.trim(),
          ...(signedIn ? {} : { guestName: guestName.trim(), guestEmail: guestEmail.trim() }),
          website,
        },
      }),
    onSuccess: () => {
      setText("");
      if (!signedIn) setGuestName("");
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
  const canSubmit = text.trim().length >= 2 && (signedIn || guestName.trim().length >= 2);

  return (
    <section className="mt-14">
      <div className="kicker">
        <MessageCircle className="h-3.5 w-3.5" />
        Discussion {list.length > 0 && <span className="text-muted-foreground font-medium normal-case tracking-normal">({list.length})</span>}
      </div>

      <form
        className="mt-4 border border-border/70 bg-card p-5"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          post.mutate();
        }}
      >
        {/* Honeypot field — hidden from real visitors, invisible to screen readers */}
        <input
          type="text"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="absolute h-0 w-0 opacity-0 pointer-events-none"
        />

        {!signedIn && (
          <div className="mb-3 grid gap-3 sm:grid-cols-2">
            <Input
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              required
              className="rounded-none"
            />
            <Input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              placeholder="Email (optional, not published)"
              maxLength={200}
              className="rounded-none"
            />
          </div>
        )}

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your thoughts, tips or questions…"
          rows={4}
          maxLength={2000}
          className="rounded-none"
        />
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground">
            {signedIn ? "Be kind and stay on topic." : "Commenting as a guest — be kind and stay on topic."}
          </span>
          <Button type="submit" className="rounded-none" disabled={post.isPending || !canSubmit}>
            {post.isPending ? "Posting…" : "Post comment"}
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {list.map((c: any) => (
          <div key={c.id} className="border border-border/60 bg-card p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center border border-border bg-muted text-foreground text-sm font-bold">
                {(c.author_name ?? "R").slice(0, 1).toUpperCase()}
              </span>
              <div>
                <div className="text-sm font-semibold">
                  {c.author_name}
                  {!c.user_id && <span className="ml-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Guest</span>}
                </div>
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

import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { searchPosts } from "@/lib/posts.functions";
import { PostCard } from "@/components/post-card";

const search = z.object({ q: z.string().optional() });

export const Route = createFileRoute("/search")({
  validateSearch: search,
  head: () => ({
    meta: [
      { title: "Search | Academia HQ Blog" },
      { name: "description", content: "Search Academia HQ articles on WAEC, JAMB, scholarships and more." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const query = useQuery({
    queryKey: ["search", q],
    queryFn: () => (q ? searchPosts({ data: { q } }) : Promise.resolve([])),
    enabled: !!q,
  });

  return (
    <div className="container-blog py-10 min-h-[60vh]">
      <div className="flex items-center gap-3">
        <Search className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-2xl md:text-3xl font-bold">
          {q ? <>Search: <span className="text-primary">{q}</span></> : "Search articles"}
        </h1>
      </div>
      {q && query.data && (
        <p className="mt-2 text-sm text-muted-foreground">{query.data.length} results</p>
      )}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {(query.data ?? []).map((p) => <PostCard key={p.id} post={p} />)}
      </div>
      {q && !query.isLoading && (query.data ?? []).length === 0 && (
        <div className="mt-12 rounded-xl border border-dashed p-12 text-center text-muted-foreground">
          No articles matched "{q}".
        </div>
      )}
    </div>
  );
}

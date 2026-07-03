import { createFileRoute, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { listPostsByCategory } from "@/lib/posts.functions";
import { PostCard } from "@/components/post-card";
import { AdSlot } from "@/components/ad-slot";

const categoryQuery = (slug: string) =>
  queryOptions({
    queryKey: ["category", slug],
    queryFn: () => listPostsByCategory({ data: { slug } }),
  });

export const Route = createFileRoute("/category/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(categoryQuery(params.slug));
    if (!data.category) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const name = loaderData?.category?.name ?? "Category";
    return {
      meta: [
        { title: `${name} — Academia HQ Blog` },
        { name: "description", content: `${name} news, updates and resources from Academia HQ.` },
        { property: "og:title", content: `${name} — Academia HQ Blog` },
        { property: "og:url", content: `/category/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/category/${params.slug}` }],
    };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <div className="container-blog py-24 text-center">
      <h1 className="text-3xl font-bold">Category not found</h1>
    </div>
  ),
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(categoryQuery(slug));
  const cat = data.category!;

  return (
    <div className="container-blog py-10">
      <nav className="text-xs text-muted-foreground">
        <a href="/" className="hover:text-primary">Home</a> · <span>{cat.name}</span>
      </nav>
      <header className="mt-4 border-b border-border/60 pb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-primary">Topic</div>
        <h1 className="mt-2 text-4xl md:text-5xl font-extrabold tracking-tight">{cat.name}</h1>
        {cat.description && <p className="mt-3 max-w-2xl text-muted-foreground">{cat.description}</p>}
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[2.4fr_1fr]">
        <div>
          {data.posts.length === 0 ? (
            <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
              No articles published in this category yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {data.posts.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </div>
        <aside className="space-y-6">
          <AdSlot format="large-rectangle" />
          <AdSlot format="sidebar" className="hidden lg:flex" />
        </aside>
      </div>
    </div>
  );
}

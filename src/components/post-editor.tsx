import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { adminListCategories, adminUpsertPost } from "@/lib/admin-posts.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor";

type Initial = Partial<{
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category_id: string;
  status: "draft" | "published";
  featured: boolean;
  read_minutes: number;
}>;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

export default function PostEditor({ initial = {}, onSaved }: { initial?: Initial; onSaved: () => void }) {
  const cats = useQuery({ queryKey: ["admin-cats"], queryFn: () => adminListCategories() });
  const [values, setValues] = useState({
    title: initial.title ?? "",
    slug: initial.slug ?? "",
    excerpt: initial.excerpt ?? "",
    content: initial.content ?? "",
    cover_image: initial.cover_image ?? "",
    category_id: initial.category_id ?? "",
    status: (initial.status ?? "draft") as "draft" | "published",
    featured: initial.featured ?? false,
    read_minutes: initial.read_minutes ?? 5,
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof typeof values>(k: K, v: (typeof values)[K]) => setValues((p) => ({ ...p, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const isContentEmpty = values.content.replace(/<[^>]*>/g, "").trim().length === 0;
    if (isContentEmpty) {
      toast.error("Content can't be empty");
      return;
    }
    setSaving(true);
    try {
      await adminUpsertPost({
        data: {
          id: initial.id,
          values: {
            ...values,
            category_id: values.category_id || null,
            cover_image: values.cover_image || null,
            excerpt: values.excerpt || null,
          },
        },
      });
      toast.success(initial.id ? "Post updated" : "Post created");
      onSaved();
    } catch (err: any) {
      toast.error(err.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="container-blog py-10 max-w-4xl">
      <h1 className="text-3xl font-bold">{initial.id ? "Edit post" : "New post"}</h1>

      <div className="mt-8 grid gap-6">
        <div>
          <Label>Title</Label>
          <Input
            required
            value={values.title}
            onChange={(e) => {
              const t = e.target.value;
              set("title", t);
              if (!initial.id && !values.slug) set("slug", slugify(t));
            }}
            className="mt-1.5 text-lg"
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>Slug</Label>
            <Input required value={values.slug} onChange={(e) => set("slug", slugify(e.target.value))} className="mt-1.5 font-mono text-sm" />
          </div>
          <div>
            <Label>Category</Label>
            <Select value={values.category_id} onValueChange={(v) => set("category_id", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue placeholder="Choose a category" /></SelectTrigger>
              <SelectContent>
                {cats.data?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Cover image URL</Label>
          <Input value={values.cover_image} onChange={(e) => set("cover_image", e.target.value)} placeholder="https://…" className="mt-1.5" />
        </div>

        <div>
          <Label>Excerpt</Label>
          <Textarea value={values.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={3} maxLength={500} className="mt-1.5" />
        </div>

        <div>
          <Label>Content</Label>
          <div className="mt-1.5">
            <RichTextEditor value={values.content} onChange={(html) => set("content", html)} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div>
            <Label>Reading time (min)</Label>
            <Input type="number" min={1} max={120} value={values.read_minutes} onChange={(e) => set("read_minutes", Number(e.target.value))} className="mt-1.5" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={values.status} onValueChange={(v: any) => set("status", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-3">
            <Switch id="featured" checked={values.featured} onCheckedChange={(v) => set("featured", v)} />
            <Label htmlFor="featured">Featured</Label>
          </div>
        </div>

        <div className="flex gap-3 border-t border-border pt-6">
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save post"}</Button>
          <Button type="button" variant="outline" onClick={onSaved}>Cancel</Button>
        </div>
      </div>
    </form>
  );
}

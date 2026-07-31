import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save } from "lucide-react";
import { adminListArchive, adminUpsertArchive, adminDeleteArchive } from "@/lib/archive.functions";
import { ARCHIVE_CATEGORIES } from "@/lib/archive-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/admin/archive")({
  head: () => ({ meta: [{ title: "Academia HQ Blog" }, { name: "robots", content: "noindex" }] }),
  component: AdminArchive,
});

type Draft = {
  id?: string | null;
  title: string;
  slug: string;
  description: string;
  category: string;
  level: string;
  subject: string;
  file_url: string;
  file_type: string;
  file_size: string;
  featured: boolean;
  status: "published" | "draft";
  sort_order: number;
};

const blank: Draft = {
  id: null,
  title: "",
  slug: "",
  description: "",
  category: "lesson-notes",
  level: "",
  subject: "",
  file_url: "",
  file_type: "PDF",
  file_size: "",
  featured: false,
  status: "published",
  sort_order: 0,
};

function toDraft(row: any): Draft {
  return {
    id: row.id,
    title: row.title ?? "",
    slug: row.slug ?? "",
    description: row.description ?? "",
    category: row.category ?? "lesson-notes",
    level: row.level ?? "",
    subject: row.subject ?? "",
    file_url: row.file_url ?? "",
    file_type: row.file_type ?? "PDF",
    file_size: row.file_size ?? "",
    featured: !!row.featured,
    status: row.status === "draft" ? "draft" : "published",
    sort_order: row.sort_order ?? 0,
  };
}

function AdminArchive() {
  const list = useQuery({ queryKey: ["admin-archive"], queryFn: () => adminListArchive() });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const set = (patch: Partial<Draft>) => setDraft((d) => (d ? { ...d, ...patch } : d));

  const save = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      await adminUpsertArchive({
        data: {
          id: draft.id ?? null,
          title: draft.title.trim(),
          slug: draft.slug.trim(),
          description: draft.description,
          category: draft.category,
          level: draft.level,
          subject: draft.subject,
          file_url: draft.file_url.trim(),
          file_type: draft.file_type.trim() || "PDF",
          file_size: draft.file_size,
          featured: draft.featured,
          status: draft.status,
          sort_order: Number(draft.sort_order) || 0,
        },
      });
      toast.success("Saved");
      setDraft(null);
      list.refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this resource?")) return;
    try {
      await adminDeleteArchive({ data: { id } });
      toast.success("Deleted");
      list.refetch();
    } catch (e: any) {
      toast.error(e.message ?? "Failed");
    }
  };

  return (
    <div className="container-blog py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Archive downloads</h1>
          <p className="text-sm text-muted-foreground">
            Lesson notes, schemes of work, exam series, AI prompt formats and AI class resources.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin"><Button variant="outline">Back to dashboard</Button></Link>
          <Button onClick={() => setDraft({ ...blank })}><Plus className="mr-1.5 h-4 w-4" />New resource</Button>
        </div>
      </div>

      {draft && (
        <div className="mt-8 rounded-xl border border-border/60 bg-card p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  set({
                    title,
                    slug: draft.id
                      ? draft.slug
                      : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80),
                  });
                }}
                placeholder="SS2 Biology Lesson Notes — First Term"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug</Label>
              <Input value={draft.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="ss2-biology-lesson-notes" />
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <select
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={draft.category}
                onChange={(e) => set({ category: e.target.value })}
              >
                {ARCHIVE_CATEGORIES.map((c) => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>Download link (URL)</Label>
              <Input value={draft.file_url} onChange={(e) => set({ file_url: e.target.value })} placeholder="https://…/notes.pdf" />
            </div>
            <div className="space-y-1.5">
              <Label>Level</Label>
              <Input value={draft.level} onChange={(e) => set({ level: e.target.value })} placeholder="SSS2" />
            </div>
            <div className="space-y-1.5">
              <Label>Subject</Label>
              <Input value={draft.subject} onChange={(e) => set({ subject: e.target.value })} placeholder="Biology" />
            </div>
            <div className="space-y-1.5">
              <Label>File type</Label>
              <Input value={draft.file_type} onChange={(e) => set({ file_type: e.target.value })} placeholder="PDF" />
            </div>
            <div className="space-y-1.5">
              <Label>File size (optional)</Label>
              <Input value={draft.file_size} onChange={(e) => set({ file_size: e.target.value })} placeholder="2.4 MB" />
            </div>
            <div className="space-y-1.5">
              <Label>Sort order</Label>
              <Input
                type="number"
                value={draft.sort_order}
                onChange={(e) => set({ sort_order: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea rows={3} value={draft.description} onChange={(e) => set({ description: e.target.value })} />
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.featured} onCheckedChange={(v) => set({ featured: v })} /> Featured on home
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={draft.status === "published"} onCheckedChange={(v) => set({ status: v ? "published" : "draft" })} /> Published
            </label>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={() => setDraft(null)}>Cancel</Button>
              <Button onClick={save} disabled={saving}><Save className="mr-1.5 h-4 w-4" />{saving ? "Saving…" : "Save resource"}</Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 rounded-xl border border-border/60 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3 hidden md:table-cell">Category</th>
              <th className="px-4 py-3 hidden lg:table-cell">Link</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.data?.map((r: any) => (
              <tr key={r.id} className="border-t border-border/60">
                <td className="px-4 py-3 font-semibold">{r.title}</td>
                <td className="px-4 py-3 hidden md:table-cell text-muted-foreground">
                  {ARCHIVE_CATEGORIES.find((c) => c.key === r.category)?.label ?? r.category}
                </td>
                <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground truncate max-w-[220px]">
                  {r.file_url || "—"}
                </td>
                <td className="px-4 py-3 text-xs">{r.status}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => setDraft(toDraft(r))}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => remove(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </td>
              </tr>
            ))}
            {list.data?.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground">No archive resources yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

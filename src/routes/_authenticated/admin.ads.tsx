import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2, Plus } from "lucide-react";
import {
  adminListSnippets,
  adminUpsertSnippet,
  adminDeleteSnippet,
} from "@/lib/ads.functions";
import { getMyRoles } from "@/lib/admin-posts.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/admin/ads")({
  head: () => ({ meta: [{ title: "Academia HQ Blog" }, { name: "robots", content: "noindex" }] }),
  component: AdminAds,
});

type Snippet = {
  id: string;
  zone_key: string;
  name: string;
  code: string;
  enabled: boolean;
};

const ZONE_HINTS: Record<string, string> = {
  multitag: "Monetag → Sites → Add zone → Multitag. Paste the full <script> tag here.",
  popunder: "Monetag → Sites → Add zone → Onclick (Popunder). Paste the tag here.",
  push: "Monetag → Sites → Add zone → Push Notifications. Paste the tag here.",
  inpage_push: "Monetag → Sites → Add zone → In-Page Push. Paste the tag here.",
  vignette: "Monetag → Sites → Add zone → Vignette Banner. Paste the tag here.",
};

function AdminAds() {
  const roles = useQuery({ queryKey: ["my-roles"], queryFn: () => getMyRoles() });
  const isAdmin = roles.data?.includes("admin");

  const list = useQuery({
    queryKey: ["admin-ad-snippets"],
    queryFn: () => adminListSnippets() as Promise<Snippet[]>,
    enabled: isAdmin === true,
  });

  if (roles.isLoading) return <div className="container-blog py-12">Loading…</div>;
  if (isAdmin === false) {
    return (
      <div className="container-blog py-16 max-w-xl">
        <h1 className="text-2xl font-bold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">Managing ad snippets is restricted to admins.</p>
      </div>
    );
  }

  return (
    <div className="container-blog py-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Monetag ad snippets</h1>
          <p className="text-sm text-muted-foreground">
            Paste each zone's code from your Monetag dashboard. Enabled snippets load site-wide automatically.
          </p>
        </div>
        <NewZoneButton onCreated={() => list.refetch()} />
      </div>

      <div className="mt-8 space-y-6">
        {list.data?.map((s) => (
          <SnippetCard key={s.id} snippet={s} onChanged={() => list.refetch()} />
        ))}
        {list.data?.length === 0 && (
          <p className="text-muted-foreground">No zones yet.</p>
        )}
      </div>
    </div>
  );
}

function SnippetCard({ snippet, onChanged }: { snippet: Snippet; onChanged: () => void }) {
  const [name, setName] = useState(snippet.name);
  const [code, setCode] = useState(snippet.code);
  const [enabled, setEnabled] = useState(snippet.enabled);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await adminUpsertSnippet({
        data: { id: snippet.id, zone_key: snippet.zone_key, name, code, enabled },
      });
      toast.success("Saved");
      onChanged();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!confirm(`Delete zone "${snippet.name}"?`)) return;
    try {
      await adminDeleteSnippet({ data: { id: snippet.id } });
      toast.success("Deleted");
      onChanged();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to delete");
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">{snippet.zone_key}</Badge>
          {enabled ? <Badge>enabled</Badge> : <Badge variant="secondary">disabled</Badge>}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch id={`en-${snippet.id}`} checked={enabled} onCheckedChange={setEnabled} />
            <Label htmlFor={`en-${snippet.id}`} className="text-sm">Enabled</Label>
          </div>
          <Button size="sm" onClick={save} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" />Save
          </Button>
          <Button size="sm" variant="outline" onClick={remove}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        <div>
          <Label htmlFor={`name-${snippet.id}`}>Zone name</Label>
          <Input id={`name-${snippet.id}`} value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label htmlFor={`code-${snippet.id}`}>Snippet code</Label>
          <Textarea
            id={`code-${snippet.id}`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={6}
            className="mt-1 font-mono text-xs"
            placeholder="<script ...>...</script>"
          />
          <p className="mt-1.5 text-xs text-muted-foreground">
            {ZONE_HINTS[snippet.zone_key] ?? "Paste the raw <script> tag from Monetag."}
          </p>
        </div>
      </div>
    </div>
  );
}

function NewZoneButton({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [zoneKey, setZoneKey] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  const create = async () => {
    setSaving(true);
    try {
      await adminUpsertSnippet({
        data: { id: null, zone_key: zoneKey, name, code, enabled: true },
      });
      toast.success("Zone added");
      setOpen(false);
      setZoneKey(""); setName(""); setCode("");
      onCreated();
    } catch (e: any) {
      toast.error(e.message ?? "Failed to add zone");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-1.5 h-4 w-4" />New zone
      </Button>
    );
  }

  return (
    <div className="w-full mt-4 rounded-xl border border-border/60 bg-card p-5 space-y-3">
      <h3 className="font-semibold">New ad zone</h3>
      <div>
        <Label htmlFor="new-zone-key">Zone key (lowercase, digits, underscores)</Label>
        <Input id="new-zone-key" value={zoneKey} onChange={(e) => setZoneKey(e.target.value)} placeholder="e.g. interstitial" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="new-zone-name">Display name</Label>
        <Input id="new-zone-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Interstitial" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="new-zone-code">Snippet code</Label>
        <Textarea id="new-zone-code" value={code} onChange={(e) => setCode(e.target.value)} rows={5} className="mt-1 font-mono text-xs" />
      </div>
      <div className="flex gap-2">
        <Button onClick={create} disabled={saving || !zoneKey || !name}>Create</Button>
        <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </div>
  );
}

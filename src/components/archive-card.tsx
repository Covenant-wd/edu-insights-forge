import { Download, FileText } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { archiveCategoryLabel } from "@/lib/archive-categories";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ArchiveCard({ item }: { item: any }) {
  const { signedIn } = useSession();
  const disabled = !item.file_url;
  
  return (
    <div className="flex flex-col rounded-xl border border-border/60 bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-hero">
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
          <FileText className="h-5 w-5" />
        </span>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <Badge variant="outline">{item.file_type}</Badge>
          {item.featured && <Badge>Popular</Badge>}
        </div>
      </div>
      <div className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-primary">{archiveCategoryLabel(item.category)}</div>
      <h3 className="mt-1 text-base font-bold leading-snug tracking-tight">{item.title}</h3>
      {item.description && <p className="mt-1.5 text-sm text-muted-foreground line-clamp-3">{item.description}</p>}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {item.level && <span>{item.level}</span>}
        {item.subject && <span>· {item.subject}</span>}
        {item.file_size && <span>· {item.file_size}</span>}
      </div>
      <div className="mt-auto pt-4">
        {disabled ? (
          <Button variant="outline" className="w-full" disabled>Coming soon</Button>
        ) : !signedIn ? (
          <Link to="/auth" className="block">
            <Button className="w-full"><Download className="mr-1.5 h-4 w-4" />Sign in to download</Button>
          </Link>
        ) : (
          <a href={item.file_url} target="_blank" rel="noopener noreferrer" download>
            <Button className="w-full"><Download className="mr-1.5 h-4 w-4" />Download</Button>
          </a>
        )}
      </div>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { moodMeta } from "@/features/journal/schema";
import { EntryRowMenu } from "@/features/journal/components/entry-row-menu";

const PLACEHOLDER_EMOJIS = ["🌄", "🏔️", "🌧️", "🪴", "🌅", "🌊", "🌸", "🌳"];

function placeholderFor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash + id.charCodeAt(i)) % 1000;
  return PLACEHOLDER_EMOJIS[hash % PLACEHOLDER_EMOJIS.length];
}

export function EntryCard({
  entry,
}: {
  entry: {
    id: string;
    title: string | null;
    content: string;
    mood: number | null;
    imageUrl: string | null;
    tags: string[];
    date: Date;
  };
}) {
  const mood = moodMeta(entry.mood);
  const preview = entry.content.replace(/\s+/g, " ").trim().slice(0, 220);
  const moreHidden = entry.content.length > 220;

  return (
    <div className="flex items-stretch gap-4 rounded-[14px] border border-border bg-card p-4 transition-colors hover:border-primary/30">
      <Link
        href={`/journal/${entry.id}`}
        className="flex flex-1 items-stretch gap-4 min-w-0"
      >
        <div className="w-12 shrink-0 pt-0.5 text-center">
          <div className="text-[11px] font-semibold uppercase text-muted-foreground-strong">
            {format(entry.date, "MMM")}
          </div>
          <div className="text-[28px] font-bold leading-none">
            {format(entry.date, "d")}
          </div>
          <div className="text-[11px] text-muted-foreground-strong">
            {format(entry.date, "yyyy")}
          </div>
          <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-muted-foreground-strong">
            <span className="inline-block h-1 w-1 rounded-full bg-primary-soft" />
            {format(entry.date, "h:mm a")}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <h4 className="truncate text-[15px] font-bold">
              {entry.title ?? "Untitled entry"}
            </h4>
            {mood ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${mood.badge}`}
              >
                {mood.emoji} {mood.label}
              </span>
            ) : null}
          </div>
          <p className="line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
            {preview}
            {moreHidden ? "…" : ""}
          </p>
          {entry.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {entry.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border border-border bg-white/[0.03] px-2 py-0.5 text-[10.5px] font-semibold text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>

        {entry.imageUrl ? (
          <div className="relative h-[90px] w-[110px] shrink-0 overflow-hidden rounded-[10px]">
            <Image
              src={entry.imageUrl}
              alt={entry.title ?? "Entry photo"}
              fill
              className="object-cover"
              sizes="110px"
            />
          </div>
        ) : (
          <div
            className="flex h-[90px] w-[110px] shrink-0 items-center justify-center rounded-[10px] text-3xl"
            style={{
              background:
                "linear-gradient(135deg, hsl(var(--surface-2)), hsl(var(--card)))",
            }}
            aria-hidden
          >
            {placeholderFor(entry.id)}
          </div>
        )}
      </Link>

      <EntryRowMenu id={entry.id} title={entry.title ?? "Untitled"} />
    </div>
  );
}

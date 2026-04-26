function fmtHm(min: number): string {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

export function JournalStatsCard({
  mostActiveDay,
  avgWords,
  totalWords,
  totalTimeWritingMin,
}: {
  mostActiveDay: string | null;
  avgWords: number;
  totalWords: number;
  totalTimeWritingMin: number;
}) {
  return (
    <div>
      <h4 className="mb-3 text-[14px] font-bold">Journal Stats</h4>
      <Row
        label="Most Active Day"
        value={mostActiveDay ?? "—"}
        accent
      />
      <Row label="Average Words" value={`${avgWords} words`} />
      <Row label="Total Words" value={`${totalWords.toLocaleString()} words`} />
      <Row label="Total Time Writing" value={fmtHm(totalTimeWritingMin)} />
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-1.5 text-[12px] last:border-b-0">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-semibold ${accent ? "text-primary-soft" : ""}`}>
        {value}
      </span>
    </div>
  );
}

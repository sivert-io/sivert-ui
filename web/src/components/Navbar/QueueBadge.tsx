interface QueueBadgeProps {
  isSearching: boolean;
  elapsedLabel: string | null;
  onClick: () => void;
}

export function QueueBadge({
  isSearching,
  elapsedLabel,
  onClick,
}: QueueBadgeProps) {
  if (!isSearching) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex min-h-10 items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3.5 py-2 text-sm font-semibold text-secondary transition hover:border-secondary/35 hover:bg-secondary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary"
      title="Open lobby"
    >
      <span className="tabular-nums text-foreground">
        {elapsedLabel ?? "0:00"}
      </span>
    </button>
  );
}

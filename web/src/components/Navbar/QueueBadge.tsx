import { MdSearch } from "react-icons/md";

interface QueueBadgeProps {
  isSearching: boolean;
  elapsedLabel: string | null;
  className?: string;
  onClick: () => void;
}

export function QueueBadge({
  isSearching,
  elapsedLabel,
  onClick,
  className,
}: QueueBadgeProps) {
  if (!isSearching) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center gap-1 text-sm font-bold ${className || ""}`}
      title="Open lobby"
    >
      <MdSearch size={16} />
      {elapsedLabel ?? "0:00"}
    </button>
  );
}

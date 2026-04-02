import type { RankProps } from "./types";
import { getRankBadgeStyle } from "./rankBadge";
import { MdShield } from "react-icons/md";

function formatRankValue(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function Rank({ rank }: RankProps) {
  const badge = getRankBadgeStyle(rank);

  return (
    <div className="relative grid place-items-center h-6 w-22 text-sm font-medium">
      <svg
        viewBox="0 0 96 24"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full ${badge.fillClassName}`}
      >
        <path
          d="M81.7073 24H0L8.95593 0H90.6633L81.7073 24Z"
          className="fill-current"
        />
        <path
          d="M84.3666 24H83.0369L91.9929 0H93.3226L84.3666 24Z"
          className="fill-current"
        />
        <path
          d="M87.0258 24H85.6962L94.6521 0H95.9818L87.0258 24Z"
          className="fill-current"
        />
      </svg>

      <div
        className={`z-10 flex items-center justify-center gap-1 pl-2 pr-3.5 h-full w-full ${badge.textClassName}`}
      >
        <MdShield size={12} />
        <p className="truncate text-xs">
          {rank ? formatRankValue(rank) : "--"}
        </p>
      </div>
    </div>
  );
}

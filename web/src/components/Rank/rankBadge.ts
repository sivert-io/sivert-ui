export type RankTier =
  | "unranked"
  | "noob"
  | "beginner"
  | "apprentice"
  | "skilled"
  | "advanced"
  | "expert"
  | "pro"
  | "elite"
  | "legend";

export interface RankBadgeStyle {
  tier: RankTier;
  bgClassName: string;
  textClassName: string;
  className: string;
}

type RankPaletteEntry = {
  tier: RankTier;
  bgClassName: string;
  textClassName: string;
};

const RANK_PALETTE: RankPaletteEntry[] = [
  {
    tier: "noob",
    bgClassName: "bg-slate-800",
    textClassName: "text-slate-200",
  },
  {
    tier: "beginner",
    bgClassName: "bg-zinc-700",
    textClassName: "text-zinc-100",
  },
  {
    tier: "apprentice",
    bgClassName: "bg-stone-700",
    textClassName: "text-stone-100",
  },
  {
    tier: "skilled",
    bgClassName: "bg-amber-700",
    textClassName: "text-amber-100",
  },
  {
    tier: "advanced",
    bgClassName: "bg-lime-600",
    textClassName: "text-lime-950",
  },
  {
    tier: "expert",
    bgClassName: "bg-emerald-600",
    textClassName: "text-emerald-950",
  },
  { tier: "pro", bgClassName: "bg-cyan-500", textClassName: "text-cyan-950" },
  { tier: "elite", bgClassName: "bg-blue-600", textClassName: "text-blue-50" },
  {
    tier: "legend",
    bgClassName: "bg-violet-600",
    textClassName: "text-violet-50",
  },
  {
    tier: "legend",
    bgClassName: "bg-fuchsia-600",
    textClassName: "text-fuchsia-50",
  },
];

const BASE_BADGE_CLASS =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function getRankBadgeStyle(rank?: number, maxRank = 10): RankBadgeStyle {
  if (rank == null || Number.isNaN(rank)) {
    return {
      tier: "unranked",
      bgClassName: "bg-slate-200",
      textClassName: "text-slate-500",
      className: `${BASE_BADGE_CLASS} bg-slate-200 text-slate-500`,
    };
  }

  const safeRank = clamp(rank, 1, maxRank);
  const paletteIndex = Math.round(
    ((safeRank - 1) / Math.max(maxRank - 1, 1)) * (RANK_PALETTE.length - 1),
  );

  const entry = RANK_PALETTE[paletteIndex];

  return {
    tier: entry.tier,
    bgClassName: entry.bgClassName,
    textClassName: entry.textClassName,
    className: `${BASE_BADGE_CLASS} ${entry.bgClassName} ${entry.textClassName}`,
  };
}

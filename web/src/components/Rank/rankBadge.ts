export const RANK_STAGE_NAMES = [
  "noob",
  "rookie",
  "trainee",
  "novice",
  "beginner",
  "learner",
  "initiate",
  "student",
  "junior",
  "apprentice",
  "capable",
  "steady",
  "skilled",
  "trained",
  "practiced",
  "competent",
  "adept",
  "seasoned",
  "advanced",
  "sharp",
  "expert",
  "specialist",
  "veteran",
  "master",
  "pro",
  "elite",
  "champion",
  "hero",
  "epic",
  "mythic",
  "legend",
  "immortal",
  "ascendant",
  "paragon",
  "titan",
  "overlord",
  "warlord",
  "grandmaster",
  "supreme",
  "celestial",
  "cosmic",
  "voidborn",
  "godlike",
  "divine",
  "eternal",
  "omega",
  "apex",
  "transcendent",
  "infinite",
  "final_form",
] as const;

export type RankTier = "unranked" | (typeof RANK_STAGE_NAMES)[number];

export interface RankBadgeStyle {
  tier: RankTier;
  stage: number;
  bgClassName: string;
  textClassName: string;
  className: string;
}

type RankPaletteEntry = {
  bgClassName: string;
  textClassName: string;
};

const RANK_PALETTE: RankPaletteEntry[] = [
  { bgClassName: "bg-slate-800", textClassName: "text-slate-200" },
  { bgClassName: "bg-zinc-700", textClassName: "text-zinc-100" },
  { bgClassName: "bg-stone-700", textClassName: "text-stone-100" },
  { bgClassName: "bg-amber-700", textClassName: "text-amber-100" },
  { bgClassName: "bg-lime-600", textClassName: "text-lime-950" },
  { bgClassName: "bg-emerald-600", textClassName: "text-emerald-950" },
  { bgClassName: "bg-cyan-500", textClassName: "text-cyan-950" },
  { bgClassName: "bg-blue-600", textClassName: "text-blue-50" },
  { bgClassName: "bg-violet-600", textClassName: "text-violet-50" },
  { bgClassName: "bg-fuchsia-600", textClassName: "text-fuchsia-50" },
];

const BASE_BADGE_CLASS =
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

const DEFAULT_MAX_RANK = 100_000;
const TOTAL_STAGES = RANK_STAGE_NAMES.length;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getStageIndex(rank: number, maxRank: number) {
  const safeRank = clamp(rank, 1, maxRank);
  return Math.floor(((safeRank - 1) / maxRank) * TOTAL_STAGES);
}

export function getRankBadgeStyle(
  rank?: number,
  maxRank = DEFAULT_MAX_RANK,
): RankBadgeStyle {
  if (rank == null || Number.isNaN(rank)) {
    return {
      tier: "unranked",
      stage: 0,
      bgClassName: "bg-slate-200",
      textClassName: "text-slate-500",
      className: `${BASE_BADGE_CLASS} bg-slate-200 text-slate-500`,
    };
  }

  const stageIndex = clamp(getStageIndex(rank, maxRank), 0, TOTAL_STAGES - 1);
  const tier = RANK_STAGE_NAMES[stageIndex];
  const palette = RANK_PALETTE[stageIndex % RANK_PALETTE.length];

  return {
    tier,
    stage: stageIndex + 1,
    bgClassName: palette.bgClassName,
    textClassName: palette.textClassName,
    className: `${BASE_BADGE_CLASS} ${palette.bgClassName} ${palette.textClassName}`,
  };
}

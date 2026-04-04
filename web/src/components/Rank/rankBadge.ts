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
  fillClassName: string;
  textClassName: string;
  className: string;
}

type RankColorBand = {
  minStage: number;
  maxStage: number;
  bgClassName: string;
  fillClassName: string;
  textClassName: string;
};

export interface RankProgressInfo {
  rank: number;
  maxRank: number;
  stage: number;
  totalStages: number;
  currentTier: RankTier;
  nextTier: RankTier | null;
  currentStageMinRank: number;
  nextStageMinRank: number | null;
  currentStageMaxRank: number;
  progressInStage: number;
  progressPercent: number;
  remainingToNextStage: number;
  isMaxStage: boolean;
}

const RANK_COLOR_BANDS: RankColorBand[] = [
  {
    minStage: 1,
    maxStage: 5,
    bgClassName: "bg-slate-800",
    fillClassName: "text-slate-800",
    textClassName: "text-slate-200",
  },
  {
    minStage: 6,
    maxStage: 10,
    bgClassName: "bg-zinc-700",
    fillClassName: "text-zinc-700",
    textClassName: "text-zinc-100",
  },
  {
    minStage: 11,
    maxStage: 15,
    bgClassName: "bg-stone-700",
    fillClassName: "text-stone-700",
    textClassName: "text-stone-100",
  },
  {
    minStage: 16,
    maxStage: 20,
    bgClassName: "bg-amber-700",
    fillClassName: "text-amber-700",
    textClassName: "text-amber-100",
  },
  {
    minStage: 21,
    maxStage: 25,
    bgClassName: "bg-lime-600",
    fillClassName: "text-lime-600",
    textClassName: "text-lime-950",
  },
  {
    minStage: 26,
    maxStage: 30,
    bgClassName: "bg-emerald-600",
    fillClassName: "text-emerald-600",
    textClassName: "text-emerald-950",
  },
  {
    minStage: 31,
    maxStage: 35,
    bgClassName: "bg-cyan-500",
    fillClassName: "text-cyan-500",
    textClassName: "text-cyan-950",
  },
  {
    minStage: 36,
    maxStage: 40,
    bgClassName: "bg-blue-600",
    fillClassName: "text-blue-600",
    textClassName: "text-blue-50",
  },
  {
    minStage: 41,
    maxStage: 45,
    bgClassName: "bg-violet-600",
    fillClassName: "text-violet-600",
    textClassName: "text-violet-50",
  },
  {
    minStage: 46,
    maxStage: 50,
    bgClassName: "bg-fuchsia-600",
    fillClassName: "text-fuchsia-600",
    textClassName: "text-fuchsia-50",
  },
];

const BASE_BADGE_CLASS =
  "inline-flex items-center gap-1 p-1 text-xs font-medium relative";

const DEFAULT_MAX_RANK = 100_000;
const TOTAL_STAGES = RANK_STAGE_NAMES.length;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getStageFromRank(rank: number, maxRank: number) {
  const safeRank = clamp(rank, 1, maxRank);
  return clamp(
    Math.floor(((safeRank - 1) / maxRank) * TOTAL_STAGES) + 1,
    1,
    TOTAL_STAGES,
  );
}

function getStageStartRank(stage: number, maxRank: number) {
  return Math.floor(((stage - 1) / TOTAL_STAGES) * maxRank) + 1;
}

function getStageEndRank(stage: number, maxRank: number) {
  if (stage >= TOTAL_STAGES) return maxRank;
  return Math.floor((stage / TOTAL_STAGES) * maxRank);
}

function getColorBand(stage: number): RankColorBand {
  return (
    RANK_COLOR_BANDS.find(
      (band) => stage >= band.minStage && stage <= band.maxStage,
    ) ?? RANK_COLOR_BANDS[0]
  );
}

export function getRankBadgeStyle(
  rank?: number | null,
  maxRank = DEFAULT_MAX_RANK,
): RankBadgeStyle {
  if (rank == null || Number.isNaN(rank)) {
    return {
      tier: "unranked",
      stage: 0,
      bgClassName: "bg-primary",
      fillClassName: "text-primary",
      textClassName: "text-black",
      className: `${BASE_BADGE_CLASS} text-primary`,
    };
  }

  const stage = getStageFromRank(rank, maxRank);
  const tier = RANK_STAGE_NAMES[stage - 1];
  const colorBand = getColorBand(stage);

  return {
    tier,
    stage,
    bgClassName: colorBand.bgClassName,
    fillClassName: colorBand.fillClassName,
    textClassName: colorBand.textClassName,
    className: `${BASE_BADGE_CLASS} ${colorBand.textClassName}`,
  };
}

export function getRankProgress(
  rank?: number | null,
  maxRank = DEFAULT_MAX_RANK,
): RankProgressInfo | null {
  if (rank == null || Number.isNaN(rank)) {
    return null;
  }

  const safeRank = clamp(rank, 1, maxRank);
  const stage = getStageFromRank(safeRank, maxRank);
  const currentTier = RANK_STAGE_NAMES[stage - 1];
  const nextTier = stage < TOTAL_STAGES ? RANK_STAGE_NAMES[stage] : null;

  const currentStageMinRank = getStageStartRank(stage, maxRank);
  const currentStageMaxRank = getStageEndRank(stage, maxRank);
  const nextStageMinRank =
    stage < TOTAL_STAGES ? getStageStartRank(stage + 1, maxRank) : null;

  const span = Math.max(currentStageMaxRank - currentStageMinRank, 1);
  const progressInStage = safeRank - currentStageMinRank;
  const progressPercent =
    stage === TOTAL_STAGES
      ? 100
      : clamp((progressInStage / span) * 100, 0, 100);

  const remainingToNextStage =
    nextStageMinRank == null ? 0 : Math.max(nextStageMinRank - safeRank, 0);

  return {
    rank: safeRank,
    maxRank,
    stage,
    totalStages: TOTAL_STAGES,
    currentTier,
    nextTier,
    currentStageMinRank,
    nextStageMinRank,
    currentStageMaxRank,
    progressInStage,
    progressPercent,
    remainingToNextStage,
    isMaxStage: stage === TOTAL_STAGES,
  };
}

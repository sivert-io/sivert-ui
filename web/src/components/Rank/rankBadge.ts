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
    bgClassName: "bg-[#9dc7ff]",
    fillClassName: "text-[#9dc7ff]",
    textClassName: "text-background",
  },
  {
    minStage: 6,
    maxStage: 10,
    bgClassName: "bg-[#8eaeff]",
    fillClassName: "text-[#8eaeff]",
    textClassName: "text-background",
  },
  {
    minStage: 11,
    maxStage: 15,
    bgClassName: "bg-[#7a88ff]",
    fillClassName: "text-[#7a88ff]",
    textClassName: "text-background",
  },
  {
    minStage: 16,
    maxStage: 20,
    bgClassName: "bg-[#9b8cff]",
    fillClassName: "text-[#9b8cff]",
    textClassName: "text-background",
  },
  {
    minStage: 21,
    maxStage: 25,
    bgClassName: "bg-[#ad91ef]",
    fillClassName: "text-[#ad91ef]",
    textClassName: "text-background",
  },
  {
    minStage: 26,
    maxStage: 30,
    bgClassName: "bg-[#c8acd6]",
    fillClassName: "text-[#c8acd6]",
    textClassName: "text-background",
  },
  {
    minStage: 31,
    maxStage: 35,
    bgClassName: "bg-[#d7a2d9]",
    fillClassName: "text-[#d7a2d9]",
    textClassName: "text-background",
  },
  {
    minStage: 36,
    maxStage: 40,
    bgClassName: "bg-[#e79ac6]",
    fillClassName: "text-[#e79ac6]",
    textClassName: "text-background",
  },
  {
    minStage: 41,
    maxStage: 45,
    bgClassName: "bg-[#f08aa8]",
    fillClassName: "text-[#f08aa8]",
    textClassName: "text-background",
  },
  {
    minStage: 46,
    maxStage: 50,
    bgClassName: "bg-[#f0647d]",
    fillClassName: "text-[#f0647d]",
    textClassName: "text-background",
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
      textClassName: "text-background",
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

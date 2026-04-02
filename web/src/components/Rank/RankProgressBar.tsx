import { getRankBadgeStyle, getRankProgress } from "./rankBadge";

type RankProgressBarProps = {
  rank?: number;
};

function formatRankValue(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

export function RankProgressBar({ rank }: RankProgressBarProps) {
  const progress = getRankProgress(rank);

  if (!progress) {
    return null;
  }

  const currentStyle = getRankBadgeStyle(progress.rank);
  const nextStyle = getRankBadgeStyle(
    progress.nextStageMinRank ?? progress.rank,
  );

  return (
    <div className="mt-3 w-full">
      <div className="mb-1 flex items-center justify-between text-xs text-primary/70">
        <span className={"capitalize " + currentStyle.fillClassName}>
          {progress.currentTier} · {progress.stage}
        </span>
        <span className={"capitalize " + nextStyle.fillClassName}>
          {progress.nextTier
            ? `${progress.nextTier} · ${progress.stage + 1}`
            : "Max stage"}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={
            "h-full rounded-full transition-[width] " + currentStyle.bgClassName
          }
          style={{ width: `${progress.progressPercent}%` }}
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-xs text-primary/60">
        <span>{formatRankValue(progress.rank)} points</span>
        <span>
          {progress.isMaxStage
            ? "Maximum rank reached"
            : `${formatRankValue(progress.remainingToNextStage)} to next stage`}
        </span>
      </div>
    </div>
  );
}

import type { RankProps } from "./types";
import { getRankBadgeStyle } from "./rankBadge";

export function Rank({ rank }: RankProps) {
  const badge = getRankBadgeStyle(rank);
  return <span className={badge.className}>{rank ?? "--"}</span>;
}

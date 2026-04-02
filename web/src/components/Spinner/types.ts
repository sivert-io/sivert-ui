export type SpinnerEasing =
  | "linear"
  | "ease"
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "smooth"
  | "snappy"
  | "stepped";

export interface SpinnerProps {
  size?: number;
  duration?: number;
  easing?: SpinnerEasing;
  direction?: "normal" | "reverse";
}

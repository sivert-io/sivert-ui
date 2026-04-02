import SpinnerIcon from "./spinner.svg?react";
import type { SpinnerEasing, SpinnerProps } from "./types";

const easingMap: Record<SpinnerEasing, string> = {
  linear: "linear",
  ease: "ease",
  "ease-in": "ease-in",
  "ease-out": "ease-out",
  "ease-in-out": "ease-in-out",
  smooth: "cubic-bezier(0.65, 0, 0.35, 1)",
  snappy: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
  stepped: "steps(12, end)",
};

export function Spinner({
  size = 16,
  duration = 0.8,
  easing = "linear",
  direction = "normal",
}: SpinnerProps) {
  return (
    <>
      <SpinnerIcon
        role="status"
        aria-label="Loading"
        style={{
          width: size,
          height: size,
          display: "block",
          transformOrigin: "center",
          animationName: "spinner-rotate",
          animationDuration: `${duration}s`,
          animationTimingFunction: easingMap[easing],
          animationIterationCount: "infinite",
          animationDirection: direction,
        }}
      />

      <style>
        {`
          @keyframes spinner-rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(720deg); }
          }
        `}
      </style>
    </>
  );
}

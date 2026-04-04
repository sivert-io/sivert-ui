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

type SpinnerMode = "rotate" | "fill";

type Props = SpinnerProps & {
  mode?: SpinnerMode;
  backgroundOpacity?: number;
  fillFadeStart?: number; // 0..1
};

export function Spinner({
  size = 16,
  duration = 0.8,
  easing = "linear",
  direction = "normal",
  mode = "rotate",
  backgroundOpacity = 0.2,
  fillFadeStart = 0.82,
}: Props) {
  if (mode === "fill") {
    return (
      <>
        <span
          role="status"
          aria-label="Loading"
          style={{
            position: "relative",
            display: "inline-block",
            width: size,
            height: size,
            lineHeight: 0,
          }}
        >
          <SpinnerIcon
            aria-hidden="true"
            style={{
              width: size,
              height: size,
              display: "block",
              opacity: backgroundOpacity,
            }}
          />

          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              display: "block",
              animationName: "spinner-fill-reveal, spinner-fill-fade",
              animationDuration: `${duration}s, ${duration}s`,
              animationTimingFunction: `${easingMap[easing]}, linear`,
              animationIterationCount: "infinite, infinite",
              animationDirection: `${direction}, ${direction}`,
              animationFillMode: "both, both",
              willChange: "clip-path, opacity",
              clipPath: "inset(100% 0 0 0)",
            }}
          >
            <SpinnerIcon
              style={{
                width: size,
                height: size,
                display: "block",
              }}
            />
          </span>
        </span>

        <style>
          {`
            @keyframes spinner-rotate {
              from { transform: rotate(0deg); }
              to { transform: rotate(720deg); }
            }

            @keyframes spinner-fill-reveal {
              from { clip-path: inset(100% 0 0 0); }
              to { clip-path: inset(0% 0 0 0); }
            }

            @keyframes spinner-fill-fade {
              0% { opacity: 1; }
              ${fillFadeStart * 100}% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}
        </style>
      </>
    );
  }

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

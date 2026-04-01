type SkeletonProps = {
  className?: string;
  circle?: boolean;
};

export function Skeleton({ className = "", circle = false }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-white/10 ${
        circle ? "rounded-full" : "rounded-xl"
      } ${className}`}
      aria-hidden="true"
    />
  );
}

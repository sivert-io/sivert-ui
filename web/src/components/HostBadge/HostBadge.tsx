import { MdVerified, MdDns } from "react-icons/md";

type HostBadgeProps = {
  variant?: "verified" | "founding";
  size?: "sm" | "md";
  className?: string;
};

export function HostBadge({
  variant = "verified",
  size = "sm",
  className = "",
}: HostBadgeProps) {
  const isVerified = variant === "verified";

  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-medium whitespace-nowrap",
        size === "sm" ? "text-[11px]" : "text-xs",
        isVerified
          ? "border-secondary/30 bg-secondary/10 text-secondary"
          : "border-info/30 bg-info/10 text-info",
        className,
      ].join(" ")}
    >
      {isVerified ? <MdVerified size={14} /> : <MdDns size={14} />}
      {isVerified ? "Verified Host" : "Founding Host"}
    </span>
  );
}

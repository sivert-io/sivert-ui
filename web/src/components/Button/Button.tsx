import cn from "classnames";
import type React from "react";
import type {
  ButtonColor,
  ButtonProps,
  ButtonVariant,
  ButtonSize,
} from "./types";
import { Link } from "react-router";

const baseStyles =
  "rounded-full transform-gpu transition-all duration-100 ease-out active:scale-[0.97] disabled:scale-[1] disabled:opacity-50 disabled:cursor-default! focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const styles: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    primary: "bg-primary text-background hover:brightness-105",
    secondary: "bg-secondary text-background hover:brightness-105",
    success: "bg-success text-background hover:brightness-105",
    warning: "bg-warning text-background hover:brightness-105",
    danger: "bg-danger text-background hover:brightness-105",
    info: "bg-info text-background hover:brightness-105",
    white: "bg-foreground text-background hover:brightness-105",
    black:
      "border border-border bg-background text-foreground hover:bg-surface",
  },
  outline: {
    primary:
      "border border-primary bg-transparent text-primary hover:bg-primary/10",
    secondary:
      "border border-secondary bg-transparent text-secondary hover:bg-secondary/10",
    success:
      "border border-success bg-transparent text-success hover:bg-success/10",
    warning:
      "border border-warning bg-transparent text-warning hover:bg-warning/10",
    danger:
      "border border-danger bg-transparent text-danger hover:bg-danger/10",
    info: "border border-info bg-transparent text-info hover:bg-info/10",
    white:
      "border border-foreground bg-transparent text-foreground hover:bg-white/10",
    black:
      "border border-border bg-transparent text-foreground hover:bg-white/5",
  },
  ghost: {
    primary: "bg-transparent text-primary hover:bg-primary/10",
    secondary: "bg-transparent text-secondary hover:bg-secondary/10",
    success: "bg-transparent text-success hover:bg-success/10",
    warning: "bg-transparent text-warning hover:bg-warning/10",
    danger: "bg-transparent text-danger hover:bg-danger/10",
    info: "bg-transparent text-info hover:bg-info/10",
    white: "bg-transparent text-foreground hover:bg-white/10",
    black: "bg-transparent text-foreground hover:bg-white/5",
  },
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "px-4 py-2 text-sm",
  sm: "h-8 px-3 text-xs",
};

const squareSizeStyles: Record<ButtonSize, string> = {
  md: "size-11 text-sm",
  sm: "size-8 text-xs",
};

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type Props = ButtonProps & NativeButtonProps;

export function Button({
  children,
  variant = "solid",
  color = "primary",
  size = "md",
  square = false,
  href,
  target,
  className = "",
  type = "button",
  ...props
}: Props) {
  const classes = cn(
    "flex shrink-0 items-center justify-center gap-2 text-nowrap font-medium",
    baseStyles,
    styles[variant][color],
    square ? squareSizeStyles[size] : sizeStyles[size],
    className,
  );

  return href ? (
    <Link className={classes} to={href} target={target}>
      {children}
    </Link>
  ) : (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}

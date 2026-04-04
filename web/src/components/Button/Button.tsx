import type React from "react";
import { Link } from "../Link";
import type { ButtonColor, ButtonProps, ButtonVariant } from "./types";

const baseStyles =
  "rounded-full transform-gpu transition-transform duration-100 ease-out active:scale-[0.9] disabled:scale-[1] disabled:opacity-50 disabled:cursor-default!";

const styles: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    primary: "bg-primary text-black",
    secondary: "bg-secondary text-white",
    danger: "bg-red-600 text-white",
    warning: "bg-yellow-400 text-black",
    white: "bg-white text-black",
    black: "bg-black text-white",
  },
  outline: {
    primary: "border border-primary bg-transparent text-primary",
    secondary: "border border-secondary bg-transparent text-secondary",
    danger: "border border-red-600 bg-transparent text-red-600",
    warning: "border border-yellow-400 bg-transparent text-yellow-400",
    white: "border border-white bg-transparent text-white",
    black: "border border-black bg-transparent text-black",
  },
  ghost: {
    primary: "bg-transparent text-primary hover:bg-primary/10",
    secondary: "bg-transparent text-secondary hover:bg-secondary/10",
    danger: "bg-transparent text-red-600 hover:bg-red-600/10",
    warning: "bg-transparent text-yellow-400 hover:bg-yellow-400/10",
    white: "bg-transparent text-white hover:bg-white/10",
    black: "bg-transparent text-black hover:bg-black/10",
  },
};

type NativeButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type Props = ButtonProps & NativeButtonProps;

export function Button({
  children,
  variant = "solid",
  color = "primary",
  square = false,
  href,
  className = "",
  type = "button",
  ...props
}: Props) {
  const classes = `font-medium flex items-center justify-center gap-2 ${baseStyles} ${styles[variant][color]} ${
    square ? "p-3" : "px-4 py-2"
  } ${className}`;

  return href ? (
    <Link className={classes} to={href}>
      {children}
    </Link>
  ) : (
    <button className={classes} type={type} {...props}>
      {children}
    </button>
  );
}

import type React from "react";
import type { ButtonColor, ButtonProps, ButtonVariant } from "./types";
import { Link } from "react-router";

const baseStyles =
  "rounded-full transform-gpu transition-transform duration-100 ease-out active:scale-[0.9]";

const styles: Record<ButtonVariant, Record<ButtonColor, string>> = {
  solid: {
    primary: "bg-lavender text-black",
    secondary: "bg-thistle text-white",
    danger: "bg-red-600 text-white",
    warning: "bg-yellow-400 text-black",
    white: "bg-white text-black",
    black: "bg-black text-white",
  },
  outline: {
    primary: "bg-transparent text-lavender border border-lavender",
    secondary: "bg-transparent text-thistle border border-thistle",
    danger: "bg-transparent text-red-600 border border-red-600",
    warning: "bg-transparent text-yellow-400 border border-yellow-400",
    white: "bg-transparent text-white border border-white",
    black: "bg-transparent text-black border border-black",
  },
  ghost: {
    primary: "bg-transparent text-lavender hover:bg-lavender/10",
    secondary: "bg-transparent text-thistle hover:bg-thistle/10",
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
  const classes = `${baseStyles} ${styles[variant][color]} ${
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

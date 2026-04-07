import type { ReactNode } from "react";

export type ButtonVariant = "solid" | "outline" | "ghost";

export type ButtonColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "white"
  | "black";

export type ButtonSize = "md" | "sm";

export type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  square?: boolean;
  href?: string;
  target?: string;
  className?: string;
};

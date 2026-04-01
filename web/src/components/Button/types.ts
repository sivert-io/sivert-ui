import type React from "react";

export type ButtonVariant = "solid" | "outline" | "ghost";

export type ButtonColor =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "white"
  | "black";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  square?: boolean;
  href?: string;
};

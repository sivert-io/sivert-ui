import type React from "react";

export type TooltipPlacement =
  | "bottom-left"
  | "bottom-center"
  | "bottom-right"
  | "top-left"
  | "top-center"
  | "top-right"
  | "right-top"
  | "right-center"
  | "right-bottom"
  | "left-top"
  | "left-center"
  | "left-bottom";

export interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  delay?: number;
  placement?: TooltipPlacement;
  wrapperClassName?: string;
  contentClassName?: string;
}

import type React from "react";

export type DropdownPlacement =
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

export interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

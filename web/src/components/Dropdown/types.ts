export interface DropdownProps {
  children: React.ReactNode;
  isOpen: boolean;
  placement?: DropdownPlacement;
  className?: string;
}

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

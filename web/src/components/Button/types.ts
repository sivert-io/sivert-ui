export type ButtonVariant = "solid" | "outline" | "ghost";

export type ButtonColor =
  | "primary"
  | "secondary"
  | "danger"
  | "warning"
  | "white"
  | "black";

export type ButtonSize = "md" | "sm";

export type ButtonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  square?: boolean;
  href?: string;
  className?: string;
};

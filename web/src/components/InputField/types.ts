import type { InputHTMLAttributes } from "react";

export type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
};

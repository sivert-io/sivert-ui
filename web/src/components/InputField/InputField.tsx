import cn from "classnames";
import type { InputFieldProps } from "./types";

export function InputField({
  className = "",
  label,
  ...props
}: InputFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="pl-3 text-sm text-primary">{label}</span>}
      <input
        className={cn(
          "w-full rounded-full border text-sm border-primary/20 bg-black/10 px-2 py-1 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary/40 focus:bg-black/15",
          className,
        )}
        {...props}
      />
    </label>
  );
}

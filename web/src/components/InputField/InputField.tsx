import cn from "classnames";
import type { InputFieldProps } from "./types";

export function InputField({
  className = "",
  label,
  ...props
}: InputFieldProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm text-primary">{label}</span>
      )}
      <input
        className={cn(
          "w-full rounded-2xl border border-primary/20 bg-black/10 px-4 py-3 text-primary outline-none transition placeholder:text-primary/40 focus:border-primary/40 focus:bg-black/15",
          className,
        )}
        {...props}
      />
    </label>
  );
}

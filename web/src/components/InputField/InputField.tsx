import cn from "classnames";
import type { InputFieldProps } from "./types";

export function InputField({
  className = "",
  label,
  ...props
}: InputFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label ? (
        <span className="pl-3.5 text-sm font-medium text-primary">{label}</span>
      ) : null}

      <input
        className={cn(
          "min-h-11 w-full rounded-full border border-primary/20 bg-black/10 px-3.5 py-2 text-base text-primary outline-none transition placeholder:text-primary/40 focus:border-primary/40 focus:bg-black/15 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          className,
        )}
        {...props}
      />
    </label>
  );
}

import type { InputFieldProps } from "./types";

export function InputField({
  className = "",
  label,
  ...props
}: InputFieldProps) {
  return (
    <label className="block">
      {label && (
        <span className="mb-1 block text-sm text-lavender">{label}</span>
      )}
      <input
        className={`w-full rounded-2xl border border-lavender/20 bg-black/10 px-4 py-3 text-lavender placeholder:text-lavender/40 outline-none transition focus:border-lavender/40 focus:bg-black/15 ${className}`}
        {...props}
      />
    </label>
  );
}

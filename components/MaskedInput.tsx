import { maskValue } from "@/lib/mask";
import { Field } from "./Field";

export function MaskedInput({
  label,
  value,
  onChange,
  mask,
  error,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  mask: string;
  error?: string[];
  placeholder?: string;
  inputMode?: "tel" | "text";
}) {
  return (
    <Field
      label={label}
      error={error}
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      onChange={(e) => onChange(maskValue(mask, e.target.value))}
    />
  );
}

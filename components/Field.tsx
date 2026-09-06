import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { ErrorBox } from "./ErrorBox";

type FieldProps = {
  label: string;
  error?: string[];
  children?: ReactNode;
};

export function Field({
  label,
  error,
  children,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`field${error?.length ? " error" : ""}`}>
      <span>{label}</span>
      {children ?? <input {...props} />}
      <ErrorBox errors={error} />
    </label>
  );
}

export function TextAreaField({
  label,
  error,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className={`field${error?.length ? " error" : ""}`}>
      <span>{label}</span>
      <textarea rows={4} {...props} />
      <ErrorBox errors={error} />
    </label>
  );
}

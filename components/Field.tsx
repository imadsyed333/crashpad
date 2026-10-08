"use client";

import { focusFieldError } from "@/lib/focusField";
import { useEffect, useRef, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";
import { ErrorBox } from "./ErrorBox";

function useFocusWhenInvalid(error?: string[]) {
  const ref = useRef<HTMLLabelElement>(null);
  useEffect(() => {
    const field = ref.current;
    if (!error?.length || !field) return;
    if (field !== document.querySelector(".field.error")) return;
    focusFieldError(document);
  }, [error]);
  return ref;
}

type FieldProps = {
  label: string;
  hint?: string;
  error?: string[];
  children?: ReactNode;
};

function FieldHint({ hint }: { hint?: string }) {
  if (!hint) return null;
  return <span className="field-hint">{hint}</span>;
}

export function Field({
  label,
  hint,
  error,
  children,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const ref = useFocusWhenInvalid(error);
  return (
    <label ref={ref} className={`field${error?.length ? " error" : ""}`}>
      <span>{label}</span>
      <FieldHint hint={hint} />
      {children ?? <input {...props} />}
      <ErrorBox errors={error} />
    </label>
  );
}

export function TextAreaField({
  label,
  hint,
  error,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useFocusWhenInvalid(error);
  return (
    <label ref={ref} className={`field${error?.length ? " error" : ""}`}>
      <span>{label}</span>
      <FieldHint hint={hint} />
      <textarea rows={4} {...props} />
      <ErrorBox errors={error} />
    </label>
  );
}

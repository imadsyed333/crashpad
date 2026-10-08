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
  error?: string[];
  children?: ReactNode;
};

export function Field({
  label,
  error,
  children,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const ref = useFocusWhenInvalid(error);
  return (
    <label ref={ref} className={`field${error?.length ? " error" : ""}`}>
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
  const ref = useFocusWhenInvalid(error);
  return (
    <label ref={ref} className={`field${error?.length ? " error" : ""}`}>
      <span>{label}</span>
      <textarea rows={4} {...props} />
      <ErrorBox errors={error} />
    </label>
  );
}

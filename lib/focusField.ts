type Focusable = {
  focus(options?: { preventScroll?: boolean }): void;
  scrollIntoView?(options?: ScrollIntoViewOptions): void;
  querySelector(selector: string): Focusable | null;
};

/** Focus and reveal the first invalid field. Returns false when none is marked. */
export function focusFieldError(root: { querySelector(selector: string): Focusable | null }) {
  const field = root.querySelector(".field.error");
  if (!field) return false;
  const control = field.querySelector("input, textarea, select");
  (control ?? field).focus({ preventScroll: true });
  field.scrollIntoView?.({ block: "nearest" });
  return true;
}

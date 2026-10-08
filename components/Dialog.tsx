"use client";

import { useEffect, useRef } from "react";

export function useDialogDismiss(open: boolean, onDismiss: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      onDismissRef.current();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      if (previous?.isConnected) previous.focus();
    };
  }, [open]);

  return panelRef;
}

export function Dialog({
  title,
  message,
  open,
  onSuccess,
  onCancel,
  isInfo = false,
}: {
  title: string;
  message: string;
  open: boolean;
  onSuccess: () => void;
  onCancel?: () => void;
  isInfo?: boolean;
}) {
  const panelRef = useDialogDismiss(open, () => (onCancel ?? onSuccess)());
  if (!open) return null;
  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      className="dialog-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
    >
      <div className="dialog">
        <h2 id="dialog-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="btn-row">
          {!isInfo && (
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onSuccess}>
            {isInfo ? "Ok" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

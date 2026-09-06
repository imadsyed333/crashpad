"use client";

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
  if (!open) return null;
  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog">
        <h2 id="dialog-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="btn-row">
          {!isInfo && (
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              No
            </button>
          )}
          <button type="button" className="btn btn-primary" onClick={onSuccess}>
            {isInfo ? "Ok" : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}

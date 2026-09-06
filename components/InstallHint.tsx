"use client";

import { X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

type BeforeInstallPrompt = Event & { prompt: () => Promise<void> };

function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as { standalone?: boolean }).standalone)
  );
}

export function InstallHint() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPrompt | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const ios = useSyncExternalStore(
    () => () => {},
    () =>
      isIos() &&
      !isStandalone() &&
      !sessionStorage.getItem("crashpad-install-dismissed"),
    () => false,
  );

  useEffect(() => {
    if (isStandalone()) return;
    if (sessionStorage.getItem("crashpad-install-dismissed")) return;
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (dismissed || (!promptEvent && !ios)) return null;

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("crashpad-install-dismissed", "1");
  };

  return (
    <div className="install-banner">
      <p>
        {promptEvent
          ? "Install CrashPad on this device for offline use."
          : "On iPhone, tap Share then Add to Home Screen to install CrashPad."}
      </p>
      {promptEvent && (
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            await promptEvent.prompt();
            dismiss();
          }}
        >
          Install
        </button>
      )}
      <button type="button" className="icon-btn" onClick={dismiss} aria-label="Dismiss install hint">
        <X />
      </button>
    </div>
  );
}

"use client";

import { deleteAllCrashPadData, initializeSecureStorage, isStorageDurable } from "@/lib/storage";
import { useCollisionStore } from "@/store/collisionStore";
import { useThemeStore } from "@/store/themeStore";
import { useVehicleStore } from "@/store/vehicleStore";
import { useEffect, useState } from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [durable, setDurable] = useState(true);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initializeSecureStorage();
        await useCollisionStore.persist.rehydrate();
        await useThemeStore.persist.rehydrate();
        await useVehicleStore.persist.rehydrate();
        const persisted = await isStorageDurable();
        if (!cancelled) {
          setDurable(persisted);
          setStatus("ready");
        }
      } catch (error) {
        console.error("Error initializing secure storage:", error);
        if (!cancelled) setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="splash">
        <h1>CrashPad</h1>
        <p className="muted">Unlocking on-device storage…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="splash">
        <h1>Couldn’t open storage</h1>
        <p className="muted">
          CrashPad could not unlock encrypted storage in this browser. You can wipe local
          data and try again.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={async () => {
            await deleteAllCrashPadData();
            window.location.reload();
          }}
        >
          Delete all CrashPad data
        </button>
      </div>
    );
  }

  return (
    <div id="app-root">
      {!durable && (
        <p className="install-banner" style={{ margin: "0.75rem auto", width: "min(40rem, calc(100% - 2rem))" }}>
          This browser may not keep site data after you close it (private/incognito).
        </p>
      )}
      {children}
    </div>
  );
}

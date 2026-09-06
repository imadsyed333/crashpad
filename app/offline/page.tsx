"use client";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OfflinePage() {
  const router = useRouter();

  useEffect(() => {
    const match = window.location.pathname.match(/^\/collisions\/([^/]+)$/);
    if (match?.[1] && match[1] !== "form") {
      router.replace(`/collisions/${match[1]}`);
    }
  }, [router]);

  return (
    <ScreenContainer title="CrashPad" backButton={false}>
      <div className="card empty">
        <h3>You&apos;re offline</h3>
        <p>The app shell is cached on this device. Open Home to keep documenting.</p>
        <button type="button" className="btn btn-primary" style={{ marginTop: "0.75rem" }} onClick={() => router.replace("/")}>
          Go Home
        </button>
      </div>
    </ScreenContainer>
  );
}

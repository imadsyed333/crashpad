"use client";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useNav } from "@/lib/nav";

export function NotFoundScreen() {
  const router = useNav();
  return (
    <ScreenContainer
      title="Collision Not Found"
      footer={
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => router.push("/")}>
            Go Back
          </button>
        </div>
      }
    >
      <div className="card empty">
        <h3>Collision not found</h3>
        <p>This collision could not be found. It may have been deleted.</p>
        <p className="hint">Tap the button below to return to your collisions list</p>
      </div>
    </ScreenContainer>
  );
}

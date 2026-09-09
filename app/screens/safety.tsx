"use client";

import { ScreenContainer } from "@/components/ScreenContainer";
import { useNav } from "@/lib/nav";

export function SafetyScreen() {
  const router = useNav();
  return (
    <ScreenContainer
      title="Safety First"
      description="Follow these steps before documenting the collision."
      footer={
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => router.push("/collisions/form/details")}
          >
            I&apos;m Safe — Continue
          </button>
        </div>
      }
    >
      <div className="card emergency">
        <h2>Call 911 Immediately If:</h2>
        <p>• Anyone is injured or in pain</p>
        <p>• There is a fire or hazardous materials</p>
        <p>• Vehicles are blocking traffic</p>
      </div>
      <p className="section-label">Safety Checklist</p>
      <div className="step">
        <div className="step-num">1</div>
        <div>
          <h3 style={{ margin: 0 }}>Assess danger</h3>
          <p className="muted">
            Move vehicles to a safe location if possible. Turn on hazard lights.
          </p>
        </div>
      </div>
      <div className="step">
        <div className="step-num">2</div>
        <div>
          <h3 style={{ margin: 0 }}>Check for injuries</h3>
          <p className="muted">
            Check yourself and all passengers. Do not move injured persons unless necessary.
          </p>
        </div>
      </div>
      <div className="step">
        <div className="step-num">3</div>
        <div>
          <h3 style={{ margin: 0 }}>Stay calm</h3>
          <p className="muted">
            Take deep breaths. You&apos;re safe now and this app will guide you through documentation.
          </p>
        </div>
      </div>
    </ScreenContainer>
  );
}

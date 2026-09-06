"use client";

import { CollisionList } from "@/components/CollisionList";
import { InstallHint } from "@/components/InstallHint";
import { ScreenContainer } from "@/components/ScreenContainer";
import { UserVehicleView } from "@/components/UserVehicleView";
import { deleteAllCrashPadData } from "@/lib/storage";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "@/components/Dialog";

export default function Home() {
  const { resetForm } = useCollisionFormStore();
  const router = useRouter();
  const [wipe, setWipe] = useState(false);

  const addCollision = () => {
    resetForm();
    router.push("/collisions/form/safety");
  };

  return (
    <ScreenContainer title="CrashPad" backButton={false}>
      <InstallHint />
      <p className="section-label">My Vehicle</p>
      <UserVehicleView />
      <div className="divider" />
      <h2 className="section-title">My Collisions</h2>
      <CollisionList onAdd={addCollision} />
      <p style={{ marginTop: "2rem" }}>
        <a href="/privacy" className="muted">
          Privacy
        </a>
        {" · "}
        <button type="button" className="icon-btn" style={{ width: "auto", padding: "0 0.4rem" }} onClick={() => setWipe(true)}>
          Delete all CrashPad data
        </button>
      </p>
      <button type="button" className="fab" aria-label="Start a collision report" onClick={addCollision}>
        +
      </button>
      <Dialog
        title="Delete all CrashPad data"
        message="This wipes collisions, your saved vehicle, media, and the encryption key from this browser. It cannot be undone."
        open={wipe}
        onCancel={() => setWipe(false)}
        onSuccess={async () => {
          await deleteAllCrashPadData();
          window.location.reload();
        }}
      />
    </ScreenContainer>
  );
}

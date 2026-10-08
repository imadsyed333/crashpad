"use client";

import { CollisionList } from "@/components/CollisionList";
import { InstallHint } from "@/components/InstallHint";
import { ScreenContainer } from "@/components/ScreenContainer";
import { UserVehicleView } from "@/components/UserVehicleView";
import { useNav } from "@/lib/nav";
import { useCollisionFormStore } from "@/store/collisionFormStore";

export function HomeScreen() {
  const { resetForm } = useCollisionFormStore();
  const router = useNav();

  const addCollision = () => {
    resetForm();
    router.push("/collisions/form/safety");
  };

  return (
    <ScreenContainer title="CrashPad" backButton={false}>
      <InstallHint />
      <button type="button" className="btn btn-primary home-start" onClick={addCollision}>
        Record a collision
      </button>
      <p className="section-label">My Vehicle</p>
      <UserVehicleView />
      <div className="divider" />
      <h2 className="section-title">My Collisions</h2>
      <CollisionList />
    </ScreenContainer>
  );
}

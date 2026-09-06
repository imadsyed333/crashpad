"use client";

import { CollisionInfoView } from "@/components/CollisionInfoView";
import { Dialog } from "@/components/Dialog";
import { ScreenContainer } from "@/components/ScreenContainer";
import { Collision } from "@/lib/types";
import { containsDraftVehicles } from "@/lib/validators";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useCollisionStore } from "@/store/collisionStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewPage() {
  const { collision, isEdit } = useCollisionFormStore();
  const { upsertCollision } = useCollisionStore();
  const [alert, setAlert] = useState(false);
  const router = useRouter();

  return (
    <ScreenContainer
      title={isEdit ? "Edit Collision" : "Submit Collision"}
      description="Make sure all your information is correct!"
      backHref={isEdit ? undefined : "/collisions/form/witnesses"}
      footer={
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (containsDraftVehicles(collision)) {
                setAlert(true);
                return;
              }
              const { savePoint, ...clean } = collision as Collision & { savePoint?: string };
              void savePoint;
              upsertCollision(clean as Collision);
              router.replace("/");
            }}
          >
            {isEdit ? "Save Collision" : "Add Collision"}
          </button>
        </div>
      }
    >
      <CollisionInfoView collision={collision} showActions />
      <Dialog
        title="Draft Vehicles Found"
        message="You have unsaved vehicles in your collision. Please save them before submitting."
        isInfo
        open={alert}
        onSuccess={() => {
          setAlert(false);
          router.push(
            isEdit ? "/collisions/form/vehicles?mode=edit" : "/collisions/form/vehicles",
          );
        }}
      />
    </ScreenContainer>
  );
}

"use client";

import { CollisionDraftButton } from "@/components/CollisionDraftButton";
import { Dialog } from "@/components/Dialog";
import { ScreenContainer } from "@/components/ScreenContainer";
import { VehicleList } from "@/components/VehicleList";
import { useNav, useSearch } from "@/lib/nav";
import { containsDraftVehicles } from "@/lib/validators";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { Plus } from "lucide-react";
import { useState } from "react";

export function VehiclesScreen() {
  const { resetForm, setEdit } = useVehicleFormStore();
  const { collision, isEdit: storeIsEdit, commitEdit } = useCollisionFormStore();
  const router = useNav();
  const isEdit = useSearch().get("mode") === "edit";
  const [alert, setAlert] = useState(false);

  const next = () => {
    if (isEdit) {
      if (storeIsEdit) {
        if (containsDraftVehicles(collision)) {
          setAlert(true);
          return;
        }
        const id = commitEdit();
        if (id) router.replace(`/collisions/${id}`);
      } else {
        router.back();
      }
    } else {
      router.push("/collisions/form/witnesses");
    }
  };

  return (
    <ScreenContainer
      title="Vehicles"
      description="Add vehicles involved in the collision."
      backHref={isEdit ? undefined : "/collisions/form/media"}
      footer={
        isEdit ? (
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={next}>
              Save Changes
            </button>
          </div>
        ) : (
          <div className="btn-row">
            <CollisionDraftButton />
            <button type="button" className="btn btn-primary" onClick={next}>
              Next
            </button>
          </div>
        )
      }
    >
      <VehicleList />
      <button
        type="button"
        className="fab"
        aria-label="Add vehicle"
        onClick={() => {
          resetForm();
          setEdit(false);
          router.push("/collisions/form/vehicle");
        }}
      >
        <Plus />
      </button>
      <Dialog
        title="Draft Vehicles Found"
        message="You have unsaved vehicles in your collision. Please save them before submitting."
        isInfo
        open={alert}
        onSuccess={() => setAlert(false)}
      />
    </ScreenContainer>
  );
}

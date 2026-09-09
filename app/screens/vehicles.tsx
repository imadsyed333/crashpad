"use client";

import { CollisionDraftButton } from "@/components/CollisionDraftButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { VehicleList } from "@/components/VehicleList";
import { useNav, useSearch } from "@/lib/nav";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { Plus } from "lucide-react";

export function VehiclesScreen() {
  const { resetForm, setEdit } = useVehicleFormStore();
  const router = useNav();
  const isEdit = useSearch().get("mode") === "edit";

  const next = () => {
    if (isEdit) router.back();
    else router.push("/collisions/form/witnesses");
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
    </ScreenContainer>
  );
}

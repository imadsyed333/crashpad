"use client";

import { CollisionDraftButton } from "@/components/CollisionDraftButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { VehicleList } from "@/components/VehicleList";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VehiclesForm() {
  const { resetForm, setEdit } = useVehicleFormStore();
  const router = useRouter();
  const isEdit = useSearchParams().get("mode") === "edit";

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
        +
      </button>
    </ScreenContainer>
  );
}

export default function VehiclesPage() {
  return (
    <Suspense>
      <VehiclesForm />
    </Suspense>
  );
}

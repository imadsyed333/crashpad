"use client";

import { DriverCard, DriverDialog } from "@/components/DriverDialog";
import { ScreenContainer } from "@/components/ScreenContainer";
import { VehicleDraftButton } from "@/components/VehicleDraftButton";
import { VehicleFields } from "@/components/VehicleFields";
import { Vehicle } from "@/lib/types";
import { validateVehicle } from "@/lib/validators";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VehicleFormPage() {
  const { vehicle, updateVehicleField, isEdit } = useVehicleFormStore();
  const { upsertVehicle } = useCollisionFormStore();
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  return (
    <ScreenContainer
      title={isEdit ? "Edit Vehicle" : "Add Vehicle"}
      description="Provide as much detail as possible about the vehicle involved."
      footer={
        <div className="btn-row">
          <VehicleDraftButton />
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const parseErrors = validateVehicle(vehicle);
              if (Object.keys(parseErrors).length !== 0) {
                setErrors(parseErrors);
                return;
              }
              const { savePoint, ...clean } = vehicle as Vehicle & { savePoint?: string };
              void savePoint;
              upsertVehicle(clean as Vehicle);
              router.back();
            }}
          >
            Save Vehicle
          </button>
        </div>
      }
    >
      <VehicleFields
        vehicle={vehicle}
        errors={errors}
        onChange={(key, value) => {
          updateVehicleField(key, value);
          setErrors({ ...errors, [key]: undefined });
        }}
      />
      <div style={{ marginTop: "0.75rem" }}>
        <DriverCard driver={vehicle.driver} showActions />
      </div>
      <DriverDialog />
    </ScreenContainer>
  );
}

"use client";

import { DriverCard, DriverDialog } from "@/components/DriverDialog";
import { ScreenContainer } from "@/components/ScreenContainer";
import { VehicleFields } from "@/components/VehicleFields";
import { useNav } from "@/lib/nav";
import { Vehicle } from "@/lib/types";
import { validateVehicle } from "@/lib/validators";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { useVehicleStore } from "@/store/vehicleStore";
import { useState } from "react";

export function VehicleScreen() {
  const { vehicle, updateVehicleField } = useVehicleFormStore();
  const { setVehicle } = useVehicleStore();
  const router = useNav();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  return (
    <ScreenContainer
      title="My Vehicle"
      description="Provide the following information about your vehicle and you as a driver"
      footer={
        <div className="btn-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const parseErrors = validateVehicle(vehicle);
              if (Object.keys(parseErrors).length !== 0) {
                setErrors(parseErrors);
                return;
              }
              setVehicle(vehicle as Vehicle);
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

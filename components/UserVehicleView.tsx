"use client";

import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { useVehicleStore } from "@/store/vehicleStore";
import { useNav } from "@/lib/nav";
import { useState } from "react";
import { Dialog } from "./Dialog";
import { VehicleCard } from "./VehicleCard";

export function UserVehicleView() {
  const { vehicle, deleteVehicle } = useVehicleStore();
  const { resetForm } = useVehicleFormStore();
  const router = useNav();
  const [confirm, setConfirm] = useState(false);

  if (!vehicle) {
    return (
      <div className="card empty">
        <h3>No vehicle saved</h3>
        <p>Save your vehicle information to quickly fill collision reports</p>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: "0.75rem" }}
          onClick={() => {
            resetForm();
            router.push("/vehicle");
          }}
        >
          Add My Vehicle
        </button>
      </div>
    );
  }

  return (
    <>
      <VehicleCard
        vehicle={vehicle}
        index={0}
        showActions
        editHref="/vehicle"
        onDelete={() => setConfirm(true)}
      />
      <Dialog
        title="Delete Your Vehicle"
        message="Are you sure you want to delete your saved vehicle information? This action cannot be undone."
        open={confirm}
        onSuccess={() => {
          deleteVehicle();
          setConfirm(false);
        }}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}

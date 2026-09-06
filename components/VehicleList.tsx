"use client";

import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useState } from "react";
import { Dialog } from "./Dialog";
import { VehicleCard } from "./VehicleCard";

export function VehicleList() {
  const { collision, deleteVehicle } = useCollisionFormStore();
  const [pending, setPending] = useState<string | null>(null);

  if (collision.vehicles.length === 0) {
    return (
      <div className="card empty">
        <h3>No vehicles added</h3>
        <p>You haven&apos;t added any vehicles involved in this collision yet.</p>
        <p className="hint">Tap the + button below to add vehicle information</p>
      </div>
    );
  }

  return (
    <>
      {collision.vehicles.map((vehicle, index) => (
        <VehicleCard
          key={vehicle.id}
          vehicle={vehicle}
          index={index}
          showActions
          onDelete={() => setPending(vehicle.id)}
        />
      ))}
      <Dialog
        title="Delete Vehicle"
        message="Are you sure you want to delete this vehicle?"
        open={pending !== null}
        onSuccess={() => {
          if (pending) deleteVehicle(pending);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

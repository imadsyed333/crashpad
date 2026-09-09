"use client";

import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { useNav, usePath } from "@/lib/nav";
import { useState } from "react";
import { Dialog } from "./Dialog";

export function VehicleDraftButton() {
  const pathname = usePath();
  const router = useNav();
  const { vehicle } = useVehicleFormStore();
  const { upsertVehicle } = useCollisionFormStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => {
          upsertVehicle({ ...vehicle, savePoint: pathname });
          setOpen(true);
        }}
      >
        Save Draft
      </button>
      <Dialog
        title="Saved Draft"
        message="Your progress has been saved. You can continue filling out the form later."
        isInfo
        open={open}
        onSuccess={() => {
          setOpen(false);
          router.back();
        }}
      />
    </>
  );
}

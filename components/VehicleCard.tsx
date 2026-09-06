"use client";

import { DraftVehicle, Vehicle } from "@/lib/types";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

function isDraft(vehicle: Vehicle | DraftVehicle): vehicle is DraftVehicle {
  return "savePoint" in vehicle;
}

export function VehicleCard({
  vehicle,
  index,
  showActions = false,
  editHref = "/collisions/form/vehicle",
  onDelete,
}: {
  vehicle: Vehicle | DraftVehicle;
  index: number;
  showActions?: boolean;
  editHref?: string;
  onDelete?: () => void;
}) {
  const { setForm, setEdit } = useVehicleFormStore();
  const router = useRouter();

  return (
    <article className="card">
      <div className="card-head">
        <h3 style={{ margin: 0 }}>Vehicle {index + 1}</h3>
        <div className="row-actions">
          {isDraft(vehicle) && <span className="badge">Draft</span>}
          {showActions && (
            <>
              <button
                type="button"
                className="icon-btn"
                aria-label="Edit vehicle"
                onClick={() => {
                  setForm(vehicle);
                  setEdit(true);
                  router.push(editHref);
                }}
              >
                <Pencil />
              </button>
              {onDelete && (
                <button
                  type="button"
                  className="icon-btn danger"
                  aria-label="Delete vehicle"
                  onClick={onDelete}
                >
                  <Trash2 />
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <p><span className="bold">Make: </span>{vehicle.make}</p>
      <p><span className="bold">Model: </span>{vehicle.model}</p>
      <p><span className="bold">Color: </span>{vehicle.color}</p>
      <p><span className="bold">License Plate: </span>{vehicle.licensePlate}</p>
      <p><span className="bold">Insurance Company: </span>{vehicle.insuranceCompany}</p>
      <p><span className="bold">Policy Number: </span>{vehicle.policyNumber}</p>
      <h4 style={{ margin: "0.75rem 0 0.25rem" }}>Driver</h4>
      {vehicle.driver ? (
        <>
          <p><span className="bold">Name: </span>{vehicle.driver.name}</p>
          <p><span className="bold">License: </span>{vehicle.driver.license}</p>
          <p><span className="bold">Phone: </span>{vehicle.driver.phoneNumber}</p>
          <p><span className="bold">Address: </span>{vehicle.driver.address}</p>
        </>
      ) : (
        <p className="muted">No information</p>
      )}
    </article>
  );
}

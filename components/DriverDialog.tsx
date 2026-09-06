"use client";

import { LICENSE_MASK, PHONE_MASK } from "@/lib/mask";
import { driverSchema } from "@/lib/schemas";
import { Driver } from "@/lib/types";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { useState } from "react";
import z from "zod";
import { Field } from "./Field";
import { MaskedInput } from "./MaskedInput";

const emptyDriver = (): Driver => ({
  name: "",
  phoneNumber: "",
  address: "",
  license: "",
});

export function DriverCard({
  driver,
  showActions,
}: {
  driver: Driver | null;
  showActions?: boolean;
}) {
  const { setDialogVisible } = useVehicleFormStore();
  return (
    <div className="card">
      <h3 style={{ marginTop: 0 }}>Driver</h3>
      {driver ? (
        <>
          <p><span className="bold">Name: </span>{driver.name}</p>
          <p><span className="bold">License: </span>{driver.license}</p>
          <p><span className="bold">Phone: </span>{driver.phoneNumber}</p>
          <p><span className="bold">Address: </span>{driver.address}</p>
        </>
      ) : (
        <p className="muted">No information</p>
      )}
      {showActions && (
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: "0.75rem" }}
          onClick={() => setDialogVisible(true)}
        >
          {driver ? "Edit Driver" : "Add Driver"}
        </button>
      )}
    </div>
  );
}

export function DriverDialog() {
  const isDialogVisible = useVehicleFormStore((s) => s.isDialogVisible);
  if (!isDialogVisible) return null;
  return <DriverDialogForm />;
}

function DriverDialogForm() {
  const { setDialogVisible, vehicle, updateVehicleField } = useVehicleFormStore();
  const [driver, setDriver] = useState<Driver>(vehicle.driver ?? emptyDriver());
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  const close = () => {
    setDialogVisible(false);
    setErrors({});
  };

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <h2>Driver Information</h2>
        <Field
          label="Name"
          placeholder="e.g. John Doe"
          value={driver.name}
          error={errors.name}
          onChange={(e) => setDriver({ ...driver, name: e.target.value })}
        />
        <MaskedInput
          label="Driver License"
          mask={LICENSE_MASK}
          placeholder="e.g. A1234-56789-01234"
          value={driver.license}
          error={errors.license}
          onChange={(license) => setDriver({ ...driver, license })}
        />
        <MaskedInput
          label="Phone Number"
          mask={PHONE_MASK}
          inputMode="tel"
          placeholder="e.g. (555) 123-4567"
          value={driver.phoneNumber}
          error={errors.phoneNumber}
          onChange={(phoneNumber) => setDriver({ ...driver, phoneNumber })}
        />
        <Field
          label="Address"
          placeholder="e.g. 123 Main St, Springfield"
          value={driver.address}
          error={errors.address}
          onChange={(e) => setDriver({ ...driver, address: e.target.value })}
        />
        <div className="btn-row">
          <button type="button" className="btn btn-outline" onClick={close}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const parse = driverSchema.safeParse(driver);
              if (!parse.success) {
                setErrors(z.flattenError(parse.error).fieldErrors);
                return;
              }
              updateVehicleField("driver", driver);
              close();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

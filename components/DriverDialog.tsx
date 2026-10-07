"use client";

import { scanLicense } from "@/lib/license";
import { LICENSE_MASK, PHONE_MASK } from "@/lib/mask";
import { driverSchema } from "@/lib/schemas";
import { Driver } from "@/lib/types";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { Camera } from "lucide-react";
import { useRef, useState } from "react";
import z from "zod";
import { ErrorBox } from "./ErrorBox";
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
  const [busy, setBusy] = useState(false);
  const [scanError, setScanError] = useState<string[] | undefined>();
  const cameraRef = useRef<HTMLInputElement>(null);

  const close = () => {
    setDialogVisible(false);
    setErrors({});
  };

  const onPhoto = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setBusy(true);
    setScanError(undefined);
    try {
      const next = await scanLicense(file);
      if (!next) {
        setScanError(["Could not read the license. Your entries were left as they are."]);
        return;
      }
      setDriver(next);
      setErrors({});
    } finally {
      setBusy(false);
      if (cameraRef.current) cameraRef.current.value = "";
    }
  };

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <h2>Driver Information</h2>
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => void onPhoto(e.target.files)}
        />
        <div className="btn-row" style={{ marginTop: 0 }}>
          <button
            type="button"
            className="btn btn-outline"
            disabled={busy}
            aria-label="Scan license"
            onClick={() => cameraRef.current?.click()}
          >
            <Camera />
            Scan license
          </button>
        </div>
        <ErrorBox errors={scanError} />
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

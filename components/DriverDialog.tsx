"use client";

import { AamvaDriver, parseAamva } from "@/lib/aamva";
import { LICENSE_MASK, PHONE_MASK } from "@/lib/mask";
import { driverSchema } from "@/lib/schemas";
import { Driver } from "@/lib/types";
import { useVehicleFormStore } from "@/store/vehicleFormStore";
import { ScanBarcode } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import z from "zod";
import { Field } from "./Field";
import { MaskedInput } from "./MaskedInput";

const UNSUPPORTED = "This browser can't scan a licence barcode. Enter the details by hand.";
const DENIED = "Camera permission is needed to scan a licence.";

type DetectedBarcode = { rawValue: string };

type BarcodeDetectorCtor = {
  new (options?: { formats?: string[] }): {
    detect: (source: HTMLVideoElement) => Promise<DetectedBarcode[]>;
  };
  getSupportedFormats: () => Promise<string[]>;
};

function barcodeDetector(): BarcodeDetectorCtor | undefined {
  return (window as Window & { BarcodeDetector?: BarcodeDetectorCtor }).BarcodeDetector;
}

async function canScanPdf417(): Promise<boolean> {
  const Detector = barcodeDetector();
  if (!Detector) return false;
  try {
    const formats = await Detector.getSupportedFormats();
    return formats.includes("pdf417");
  } catch {
    return false;
  }
}

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

function LicenceScanView({ onDone }: { onDone: (result: AamvaDriver | "denied" | "cancel") => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const Detector = barcodeDetector();
    if (!video || !Detector || !navigator.mediaDevices?.getUserMedia) {
      onDone("denied");
      return;
    }

    let stream: MediaStream | null = null;
    let timer = 0;
    let stopped = false;
    let pending = false;
    const stop = () => {
      if (stopped) return;
      stopped = true;
      window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: "environment" } }, audio: false })
      .then(async (next) => {
        if (stopped) {
          next.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = next;
        video.srcObject = next;
        try {
          await video.play();
        } catch {
          if (!stopped) onDone("denied");
          return;
        }
        if (stopped) return;
        const detector = new Detector({ formats: ["pdf417"] });
        timer = window.setInterval(() => {
          if (stopped || pending || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
          pending = true;
          detector
            .detect(video)
            .then((codes) => {
              if (stopped) return;
              for (const code of codes) {
                const parsed = parseAamva(code.rawValue);
                if (!parsed) continue;
                stop();
                onDone(parsed);
                return;
              }
            })
            .catch(() => {})
            .finally(() => {
              pending = false;
            });
        }, 200);
      })
      .catch(() => {
        if (!stopped) onDone("denied");
      });

    return stop;
  }, [onDone]);

  return (
    <div className="scan-view">
      <div className="scan-stage">
        <video ref={videoRef} className="scan-video" playsInline muted autoPlay aria-labelledby="scan-prompt" />
        <p id="scan-prompt" className="scan-prompt">
          Point the camera at the barcode on the back of your driver licence.
        </p>
      </div>
      <button type="button" className="btn btn-outline" onClick={() => onDone("cancel")}>
        Cancel
      </button>
    </div>
  );
}

function DriverDialogForm() {
  const { setDialogVisible, vehicle, updateVehicleField } = useVehicleFormStore();
  const [driver, setDriver] = useState<Driver>(vehicle.driver ?? emptyDriver());
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const mounted = useRef(true);
  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const close = () => {
    setDialogVisible(false);
    setErrors({});
  };

  const onScanDone = useCallback((result: AamvaDriver | "denied" | "cancel") => {
    setScanning(false);
    if (result === "cancel") return;
    if (result === "denied") {
      setScanError(DENIED);
      return;
    }
    setScanError(null);
    setErrors({});
    setDriver((prev) => ({
      ...prev,
      ...(result.name ? { name: result.name } : {}),
      ...(result.license ? { license: result.license } : {}),
      ...(result.address ? { address: result.address } : {}),
    }));
  }, []);

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <h2>Driver Information</h2>
        {scanning ? (
          <LicenceScanView onDone={onScanDone} />
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", marginBottom: "0.75rem" }}
              onClick={() => {
                setScanError(null);
                void canScanPdf417().then((ok) => {
                  if (!mounted.current) return;
                  if (ok) setScanning(true);
                  else setScanError(UNSUPPORTED);
                });
              }}
            >
              <ScanBarcode />
              Scan licence
            </button>
            {scanError && <p className="errors" style={{ marginBottom: "0.75rem" }}>{scanError}</p>}
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
          </>
        )}
      </div>
    </div>
  );
}

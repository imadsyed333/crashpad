"use client";

import { AamvaDriver, parseAamva } from "@/lib/aamva";
import { openPdf417Detector, type OpenedPdf417Detector } from "@/lib/barcode";
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

type ScanSession = {
  camera: Promise<MediaStream>;
  detector: Promise<OpenedPdf417Detector>;
};

type ScanResult = AamvaDriver | "denied" | "unsupported" | "cancel";

// ponytail: WASM PDF417 at full phone resolution misses the 200ms interval and
// runs hot. Cap the longest side at 1280. Upgrade: adaptive scale if detect()
// regularly exceeds the interval.
function drawWasmFrame(video: HTMLVideoElement, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const longest = Math.max(video.videoWidth, video.videoHeight);
  const scale = longest > 1280 ? 1280 / longest : 1;
  const width = Math.round(video.videoWidth * scale);
  const height = Math.round(video.videoHeight * scale);
  if (canvas.width !== width) canvas.width = width;
  if (canvas.height !== height) canvas.height = height;
  ctx.drawImage(video, 0, 0, width, height);
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

function LicenceScanView({
  camera,
  detector,
  onDone,
}: {
  camera: Promise<MediaStream>;
  detector: Promise<OpenedPdf417Detector>;
  onDone: (result: ScanResult) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      onDone("denied");
      return;
    }

    let stream: MediaStream | null = null;
    let picked: OpenedPdf417Detector | null = null;
    let timer = 0;
    let stopped = false;
    let pending = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const stop = () => {
      if (stopped) return;
      stopped = true;
      window.clearInterval(timer);
      stream?.getTracks().forEach((track) => track.stop());
    };
    const fail = (reason: "denied" | "unsupported") => {
      if (stopped) return;
      stop();
      onDone(reason);
    };
    const startLoop = () => {
      if (stopped || timer || !stream || !picked) return;
      if (picked.kind === "wasm" && !ctx) {
        fail("unsupported");
        return;
      }
      const ready = picked;
      timer = window.setInterval(() => {
        if (stopped || pending || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return;
        pending = true;
        if (ready.kind === "wasm" && ctx) drawWasmFrame(video, canvas, ctx);
        ready.detector
          .detect(ready.kind === "wasm" && ctx ? canvas : video)
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
    };

    camera
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
          fail("denied");
          return;
        }
        startLoop();
      })
      .catch(() => fail("denied"));

    detector
      .then((next) => {
        if (stopped) return;
        picked = next;
        startLoop();
      })
      .catch(() => fail("unsupported"));

    return stop;
  }, [camera, detector, onDone]);

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
  const [session, setSession] = useState<ScanSession | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const close = () => {
    setDialogVisible(false);
    setErrors({});
  };

  const onScanDone = useCallback((result: ScanResult) => {
    setSession(null);
    if (result === "cancel") return;
    if (result === "denied") {
      setScanError(DENIED);
      return;
    }
    if (result === "unsupported") {
      setScanError(UNSUPPORTED);
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
        {session ? (
          <LicenceScanView camera={session.camera} detector={session.detector} onDone={onScanDone} />
        ) : (
          <>
            <button
              type="button"
              className="btn btn-primary"
              style={{ width: "100%", marginBottom: "0.75rem" }}
              onClick={() => {
                setScanError(null);
                if (!navigator.mediaDevices?.getUserMedia) {
                  setScanError(DENIED);
                  return;
                }
                setSession({
                  camera: navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: "environment" } },
                    audio: false,
                  }),
                  detector: openPdf417Detector(),
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

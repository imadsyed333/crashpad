"use client";

import { Vehicle } from "@/lib/types";
import { Field } from "./Field";

type Errors = Partial<Record<keyof Vehicle, string[]>>;

export function VehicleFields({
  vehicle,
  errors,
  onChange,
}: {
  vehicle: Vehicle;
  errors: Errors;
  onChange: <K extends keyof Vehicle>(key: K, value: Vehicle[K]) => void;
}) {
  return (
    <>
      <Field label="Make (e.g., Toyota)" value={vehicle.make} error={errors.make} onChange={(e) => onChange("make", e.target.value)} />
      <Field label="Model (e.g., Camry)" value={vehicle.model} error={errors.model} onChange={(e) => onChange("model", e.target.value)} />
      <Field label="Color (e.g., Red)" value={vehicle.color} error={errors.color} onChange={(e) => onChange("color", e.target.value)} />
      <Field label="License Plate" value={vehicle.licensePlate} error={errors.licensePlate} onChange={(e) => onChange("licensePlate", e.target.value)} />
      <Field label="Insurance Company" value={vehicle.insuranceCompany} error={errors.insuranceCompany} onChange={(e) => onChange("insuranceCompany", e.target.value)} />
      <Field label="Policy Number" value={vehicle.policyNumber} error={errors.policyNumber} onChange={(e) => onChange("policyNumber", e.target.value)} />
    </>
  );
}

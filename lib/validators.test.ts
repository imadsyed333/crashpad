import { describe, expect, it } from "vitest";
import { Collision, DraftVehicle, Driver, Vehicle, Witness } from "./types";
import {
  containsDraftVehicles,
  validateDriver,
  validateVehicle,
  validateWitness,
} from "./validators";

const emptyVehicle = (): Vehicle => ({
  id: "v1",
  make: "",
  model: "",
  color: "",
  licensePlate: "",
  insuranceCompany: "",
  policyNumber: "",
  driver: null,
});

const filledVehicle = (): Vehicle => ({
  id: "v1",
  make: "Honda",
  model: "Civic",
  color: "Blue",
  licensePlate: "ABCD123",
  insuranceCompany: "Intact",
  policyNumber: "POL-1",
  driver: null,
});

const emptyDriver = (): Driver => ({
  name: "",
  address: "",
  phoneNumber: "",
  license: "",
});

const emptyWitness = (): Witness => ({
  id: "w1",
  name: "",
  address: "",
  phoneNumber: "",
});

const collisionWith = (vehicles: Collision["vehicles"]): Collision => ({
  id: "c1",
  date: new Date("2024-06-01T12:00:00.000Z"),
  location: { description: "near Jane and Finch", coordinates: null },
  description: "A car ran a red light",
  vehicles,
  media: [],
  witnesses: [],
  officer: null,
});

describe("validateVehicle", () => {
  it("returns field errors for an empty vehicle", () => {
    const errors = validateVehicle(emptyVehicle());
    expect(errors.make).toBeDefined();
    expect(errors.model).toBeDefined();
    expect(errors.color).toBeDefined();
    expect(errors.licensePlate).toBeDefined();
    expect(errors.insuranceCompany).toBeDefined();
    expect(errors.policyNumber).toBeDefined();
  });

  it("returns no errors for a filled vehicle", () => {
    expect(validateVehicle(filledVehicle())).toEqual({});
  });
});

describe("validateDriver", () => {
  it("returns field errors for an empty driver", () => {
    const errors = validateDriver(emptyDriver());
    expect(errors.name).toBeDefined();
    expect(errors.address).toBeDefined();
    expect(errors.phoneNumber).toBeDefined();
    expect(errors.license).toBeDefined();
  });

  it("rejects a bad phone number", () => {
    const errors = validateDriver({
      name: "Alex Rivera",
      address: "1 Main St",
      phoneNumber: "not-a-phone",
      license: "A1234-56789-01234",
    });
    expect(errors.phoneNumber).toBeDefined();
  });
});

describe("validateWitness", () => {
  it("returns field errors for an empty witness", () => {
    const errors = validateWitness(emptyWitness());
    expect(errors.name).toBeDefined();
    expect(errors.address).toBeDefined();
    expect(errors.phoneNumber).toBeDefined();
  });
});

describe("containsDraftVehicles", () => {
  it("is true only when a vehicle has a savePoint", () => {
    expect(containsDraftVehicles(collisionWith([filledVehicle()]))).toBe(false);
    const draft: DraftVehicle = {
      ...filledVehicle(),
      savePoint: "/collisions/form/vehicle",
    };
    expect(containsDraftVehicles(collisionWith([draft]))).toBe(true);
  });
});

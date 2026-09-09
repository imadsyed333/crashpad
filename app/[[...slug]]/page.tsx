"use client";

import { usePath } from "@/lib/nav";
import { screenFromPath, type ScreenKey } from "@/lib/screens";
import type { ComponentType } from "react";
import { CollisionScreen } from "../screens/collision";
import { DetailsScreen } from "../screens/details";
import { HomeScreen } from "../screens/home";
import { MediaScreen } from "../screens/media";
import { NotFoundScreen } from "../screens/not-found";
import { ReviewScreen } from "../screens/review";
import { SafetyScreen } from "../screens/safety";
import { VehicleScreen } from "../screens/vehicle";
import { VehicleFormScreen } from "../screens/vehicle-form";
import { VehiclesScreen } from "../screens/vehicles";
import { WitnessesScreen } from "../screens/witnesses";

const SCREENS: Record<ScreenKey, ComponentType> = {
  home: HomeScreen,
  vehicle: VehicleScreen,
  safety: SafetyScreen,
  details: DetailsScreen,
  media: MediaScreen,
  vehicles: VehiclesScreen,
  vehicleForm: VehicleFormScreen,
  witnesses: WitnessesScreen,
  review: ReviewScreen,
  collision: CollisionScreen,
  notFound: NotFoundScreen,
};

export default function Outlet() {
  const path = usePath();
  const Screen = SCREENS[screenFromPath(path)];
  return <Screen />;
}

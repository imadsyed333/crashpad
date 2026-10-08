export const FORM_SCREENS = {
  safety: "safety",
  details: "details",
  media: "media",
  vehicles: "vehicles",
  vehicle: "vehicleForm",
  witnesses: "witnesses",
  review: "review",
} as const;

export const REPORT_STEPS = [
  { path: "/collisions/form/safety", label: "Safety" },
  { path: "/collisions/form/details", label: "Details" },
  { path: "/collisions/form/media", label: "Media" },
  { path: "/collisions/form/vehicles", label: "Vehicles" },
  { path: "/collisions/form/witnesses", label: "Witnesses" },
  { path: "/collisions/form/review", label: "Review" },
] as const;

export function reportStep(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const index = REPORT_STEPS.findIndex((step) => step.path === path);
  if (index < 0) return null;
  return { index, total: REPORT_STEPS.length, label: REPORT_STEPS[index].label };
}

export type ScreenKey =
  | "home"
  | "vehicle"
  | (typeof FORM_SCREENS)[keyof typeof FORM_SCREENS]
  | "collision"
  | "notFound";

export function screenFromPath(pathname: string): ScreenKey {
  const path = pathname.replace(/\/+$/, "") || "/";
  if (path === "/") return "home";
  if (path === "/vehicle") return "vehicle";
  const form = path.match(/^\/collisions\/form\/([^/]+)$/);
  if (form && form[1] in FORM_SCREENS) {
    return FORM_SCREENS[form[1] as keyof typeof FORM_SCREENS];
  }
  if (path === "/collisions/form" || path.startsWith("/collisions/form/")) return "notFound";
  if (/^\/collisions\/[^/]+$/.test(path)) return "collision";
  return "notFound";
}

"use client";

import { CollisionDraftButton } from "@/components/CollisionDraftButton";
import { ErrorBox } from "@/components/ErrorBox";
import { Field, TextAreaField } from "@/components/Field";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useNav, useSearch } from "@/lib/nav";
import { detailsSchema } from "@/lib/schemas";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { MapPin } from "lucide-react";
import { useState } from "react";
import z from "zod";

function toLocalInput(date: Date) {
  const d = new Date(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function DetailsScreen() {
  const { collision, updateCollisionField } = useCollisionFormStore();
  const { location, description, date } = collision;
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [fetching, setFetching] = useState(false);
  const router = useNav();
  const isEdit = useSearch().get("mode") === "edit";

  const save = () => {
    const parse = detailsSchema.safeParse({ location, description });
    if (!parse.success) {
      setErrors(z.flattenError(parse.error).fieldErrors);
      return;
    }
    if (isEdit) router.back();
    else router.push("/collisions/form/media");
  };

  const fetchLocation = async () => {
    if (fetching) return;
    if (!navigator.geolocation) {
      window.alert("Permission required\nPermission to access location is required.");
      return;
    }
    setFetching(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        // ponytail: GPS coords only — no reverse geocode so coordinates never leave the device.
        // Upgrade: user-chosen first-party geocoder after an explicit opt-in.
        updateCollisionField("location", {
          ...location,
          coordinates: {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          },
        });
        setFetching(false);
      },
      (err) => {
        setFetching(false);
        if (err.code === err.PERMISSION_DENIED) {
          window.alert("Permission required\nPermission to access location is required.");
        }
      },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  };

  return (
    <ScreenContainer
      title="Details"
      description="Provide as much detail as possible about the collision."
      backHref={isEdit ? undefined : "/collisions/form/safety"}
      footer={
        isEdit ? (
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={save}>
              Save Changes
            </button>
          </div>
        ) : (
          <div className="btn-row">
            <CollisionDraftButton />
            <button type="button" className="btn btn-primary" onClick={save}>
              Next
            </button>
          </div>
        )
      }
    >
      <div className="location-row">
        <Field
          label={'Where are you? (Ex. "near Jane and Finch")'}
          value={location.description}
          error={errors.location}
          onChange={(e) => {
            updateCollisionField("location", { ...location, description: e.target.value });
            setErrors({ ...errors, location: undefined });
          }}
        />
        <button
          type="button"
          className="icon-btn"
          onClick={() => void fetchLocation()}
          aria-label={fetching ? "Fetching current location" : "Use current location"}
          disabled={fetching}
        >
          <MapPin />
        </button>
      </div>
      {location.coordinates && (
        <p className="muted">
          GPS {location.coordinates.latitude.toFixed(5)}, {location.coordinates.longitude.toFixed(5)}
        </p>
      )}
      <TextAreaField
        label="What happened? (Ex. 'A car ran a red light and hit me')"
        value={description}
        error={errors.description}
        onChange={(e) => {
          updateCollisionField("description", e.target.value);
          setErrors({ ...errors, description: undefined });
        }}
      />
      <Field
        label="When did the collision happen?"
        type="datetime-local"
        value={toLocalInput(date)}
        onChange={(e) => updateCollisionField("date", new Date(e.target.value))}
      />
      <ErrorBox errors={errors.date} />
    </ScreenContainer>
  );
}

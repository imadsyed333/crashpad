"use client";

import { Collision } from "@/lib/types";
import { useRouter } from "next/navigation";
import { MediaGrid } from "./Media";
import { VehicleCard } from "./VehicleCard";
import { WitnessCard } from "./WitnessDialog";

export function CollisionInfoView({
  collision,
  showActions = false,
}: {
  collision: Collision;
  showActions?: boolean;
}) {
  const router = useRouter();
  const date = new Date(collision.date);

  return (
    <div>
      <div className="card-head">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Details</h2>
        {showActions && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Edit details"
            onClick={() => router.push("/collisions/form/details?mode=edit")}
          >
            ✎
          </button>
        )}
      </div>
      <div className="divider" />
      <div className="card">
        <p><span className="bold">Location: </span>{collision.location.description}</p>
        <p><span className="bold">Description: </span>{collision.description}</p>
        <p><span className="bold">Date: </span>{date.toDateString()}</p>
        <p>
          <span className="bold">Time: </span>
          {date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
        {collision.location.coordinates && (
          <p className="muted">
            GPS {collision.location.coordinates.latitude.toFixed(5)},{" "}
            {collision.location.coordinates.longitude.toFixed(5)}
          </p>
        )}
      </div>

      <div className="card-head">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Media</h2>
        {showActions && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Edit media"
            onClick={() => router.push("/collisions/form/media?mode=edit")}
          >
            ✎
          </button>
        )}
      </div>
      <div className="divider" />
      {collision.media.length === 0 ? (
        <p className="muted" style={{ fontStyle: "italic" }}>No media added.</p>
      ) : (
        <MediaGrid media={collision.media} />
      )}

      <div className="card-head" style={{ marginTop: "1rem" }}>
        <h2 className="section-title" style={{ marginBottom: 0 }}>Vehicles</h2>
        {showActions && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Edit vehicles"
            onClick={() => router.push("/collisions/form/vehicles?mode=edit")}
          >
            ✎
          </button>
        )}
      </div>
      <div className="divider" />
      {collision.vehicles.length === 0 && (
        <p className="muted" style={{ fontStyle: "italic" }}>No vehicles added.</p>
      )}
      {collision.vehicles.map((vehicle, index) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
      ))}

      <div className="card-head">
        <h2 className="section-title" style={{ marginBottom: 0 }}>Witnesses</h2>
        {showActions && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Edit witnesses"
            onClick={() => router.push("/collisions/form/witnesses?mode=edit")}
          >
            ✎
          </button>
        )}
      </div>
      <div className="divider" />
      {collision.witnesses.length === 0 && (
        <p className="muted" style={{ fontStyle: "italic" }}>No witnesses added.</p>
      )}
      {collision.witnesses.map((witness, index) => (
        <WitnessCard key={witness.id} witness={witness} index={index} />
      ))}
    </div>
  );
}

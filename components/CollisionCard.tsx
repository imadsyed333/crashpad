"use client";

import { Collision, DraftCollision } from "@/lib/types";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

function isDraft(collision: Collision | DraftCollision): collision is DraftCollision {
  return "savePoint" in collision;
}

export function CollisionCard({
  collision,
  onDelete,
}: {
  collision: Collision | DraftCollision;
  onDelete?: () => void;
}) {
  const { setForm } = useCollisionFormStore();
  const router = useRouter();
  const date = new Date(collision.date);
  const formattedDate = date.toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article
      className="card"
      role="button"
      tabIndex={0}
      onClick={() => {
        setForm(collision);
        if (isDraft(collision)) router.push(collision.savePoint);
        else router.push(`/collisions/${collision.id}`);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") e.currentTarget.click();
      }}
    >
      <div className="card-head">
        <div className="grow">
          <h3 style={{ margin: 0, fontSize: "1.15rem" }}>
            {collision.location.description || "No location provided"}
          </h3>
          <p className="muted" style={{ margin: "0.25rem 0 0" }}>
            {formattedDate} at {formattedTime}
          </p>
        </div>
        <div className="row-actions">
          {isDraft(collision) && <span className="badge">Draft</span>}
          {onDelete && (
            <button
              type="button"
              className="icon-btn danger"
              aria-label="Delete collision"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 />
            </button>
          )}
        </div>
      </div>
      {collision.description && (
        <p className="muted" style={{ marginTop: "0.5rem" }}>
          {collision.description}
        </p>
      )}
      <div className="pills">
        <span className="pill">
          {collision.vehicles.length} vehicle{collision.vehicles.length === 1 ? "" : "s"}
        </span>
        <span className="pill">
          {collision.witnesses.length} witness{collision.witnesses.length === 1 ? "" : "es"}
        </span>
        <span className="pill">{collision.media.length} media</span>
      </div>
    </article>
  );
}

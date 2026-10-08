"use client";

import { useCollisionStore } from "@/store/collisionStore";
import { useState } from "react";
import { CollisionCard } from "./CollisionCard";
import { Dialog } from "./Dialog";

export function CollisionList() {
  const { collisions, deleteCollision } = useCollisionStore();
  const [pending, setPending] = useState<string | null>(null);

  if (collisions.length === 0) {
    return (
      <div className="card empty">
        <h3>No collisions recorded</h3>
        <p>Record a collision here when it happens.</p>
      </div>
    );
  }

  return (
    <>
      {collisions.map((collision) => (
        <CollisionCard
          key={collision.id}
          collision={collision}
          onDelete={() => setPending(collision.id)}
        />
      ))}
      <Dialog
        title="Delete Collision"
        message="Are you sure you want to delete this collision?"
        open={pending !== null}
        onSuccess={() => {
          if (pending) deleteCollision(pending);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

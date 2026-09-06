"use client";

import { useCollisionStore } from "@/store/collisionStore";
import { CircleCheck } from "lucide-react";
import { useState } from "react";
import { CollisionCard } from "./CollisionCard";
import { Dialog } from "./Dialog";

export function CollisionList({ onAdd }: { onAdd: () => void }) {
  const { collisions, deleteCollision } = useCollisionStore();
  const [pending, setPending] = useState<string | null>(null);

  if (collisions.length === 0) {
    return (
      <div className="card empty">
        <CircleCheck size={32} strokeWidth={1.75} className="muted" />
        <h3>No collisions recorded</h3>
        <p>Great news! You haven&apos;t recorded any collisions yet.</p>
        <button type="button" className="btn btn-primary" style={{ marginTop: "0.75rem" }} onClick={onAdd}>
          Add Collision
        </button>
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

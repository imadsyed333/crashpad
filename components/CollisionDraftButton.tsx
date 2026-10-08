"use client";

import { useNav, usePath } from "@/lib/nav";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useCollisionStore } from "@/store/collisionStore";

export function CollisionDraftButton() {
  const pathname = usePath();
  const router = useNav();
  const { collision } = useCollisionFormStore();
  const { upsertCollision } = useCollisionStore();

  return (
    <button
      type="button"
      className="btn btn-outline"
      onClick={() => {
        upsertCollision({ ...collision, savePoint: pathname });
        router.replace("/");
      }}
    >
      Save & exit
    </button>
  );
}

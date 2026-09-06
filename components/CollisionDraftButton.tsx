"use client";

import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useCollisionStore } from "@/store/collisionStore";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Dialog } from "./Dialog";

export function CollisionDraftButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { collision } = useCollisionFormStore();
  const { upsertCollision } = useCollisionStore();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-outline"
        onClick={() => {
          upsertCollision({ ...collision, savePoint: pathname });
          setOpen(true);
        }}
      >
        Save Draft
      </button>
      <Dialog
        title="Saved Draft"
        message="Your progress has been saved. You can continue filling out the form later."
        isInfo
        open={open}
        onSuccess={() => {
          setOpen(false);
          router.replace("/");
        }}
      />
    </>
  );
}

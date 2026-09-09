"use client";

import { CollisionInfoView } from "@/components/CollisionInfoView";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useNav, usePath } from "@/lib/nav";
import { exportCollisionPdf } from "@/lib/pdf";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useCollisionStore } from "@/store/collisionStore";
import { FileDown, Pencil } from "lucide-react";
import { NotFoundScreen } from "./not-found";

export function CollisionScreen() {
  const pathname = usePath();
  const id = pathname.match(/^\/collisions\/([^/]+)$/)?.[1] ?? "";
  const collision = useCollisionStore((s) => s.getCollision(id));
  const { setForm, setEdit } = useCollisionFormStore();
  const router = useNav();

  if (!collision) return <NotFoundScreen />;

  return (
    <ScreenContainer
      title="View Collision"
      footer={
        <div className="btn-row">
          <button type="button" className="btn btn-outline" onClick={() => exportCollisionPdf(collision)}>
            <FileDown />
            Export to PDF
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setForm(collision);
              setEdit(true);
              router.push("/collisions/form/review");
            }}
          >
            <Pencil />
            Edit
          </button>
        </div>
      }
    >
      <CollisionInfoView collision={collision} />
    </ScreenContainer>
  );
}

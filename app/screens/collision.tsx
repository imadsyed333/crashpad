"use client";

import { CollisionInfoView } from "@/components/CollisionInfoView";
import { ScreenContainer } from "@/components/ScreenContainer";
import { usePath } from "@/lib/nav";
import { exportCollisionPdf } from "@/lib/pdf";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useCollisionStore } from "@/store/collisionStore";
import { FileDown } from "lucide-react";
import { useEffect } from "react";
import { NotFoundScreen } from "./not-found";

export function CollisionScreen() {
  const pathname = usePath();
  const id = pathname.match(/^\/collisions\/([^/]+)$/)?.[1] ?? "";
  const collision = useCollisionStore((s) => s.getCollision(id));
  const beginEdit = useCollisionFormStore((s) => s.beginEdit);

  useEffect(() => {
    useCollisionFormStore.getState().discardEdit();
  }, []);

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
        </div>
      }
    >
      <CollisionInfoView
        collision={collision}
        showActions
        beforeEdit={() => beginEdit(collision)}
      />
    </ScreenContainer>
  );
}

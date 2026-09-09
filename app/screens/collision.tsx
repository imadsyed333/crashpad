"use client";

import { CollisionInfoView } from "@/components/CollisionInfoView";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useNav, usePath } from "@/lib/nav";
import { downloadReport, openPrintReport, shareReport } from "@/lib/pdf";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useCollisionStore } from "@/store/collisionStore";
import { Download, Pencil, Printer, Share2 } from "lucide-react";
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
        <>
          <div className="btn-row">
            <button type="button" className="btn btn-outline" onClick={() => downloadReport(collision)}>
              <Download />
              Download
            </button>
            <button type="button" className="btn btn-outline" onClick={() => openPrintReport(collision)}>
              <Printer />
              Print
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
          <button
            type="button"
            className="btn btn-outline"
            style={{ width: "100%", marginTop: "0.5rem" }}
            onClick={() => void shareReport(collision)}
          >
            <Share2 />
            Share
          </button>
        </>
      }
    >
      <CollisionInfoView collision={collision} />
    </ScreenContainer>
  );
}

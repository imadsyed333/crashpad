"use client";

import { CollisionInfoView } from "@/components/CollisionInfoView";
import { ScreenContainer } from "@/components/ScreenContainer";
import { downloadReport, openPrintReport, shareReport } from "@/lib/pdf";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useCollisionStore } from "@/store/collisionStore";
import { useParams, usePathname, useRouter } from "next/navigation";

export default function CollisionViewPage() {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const match = pathname.match(/^\/collisions\/([^/]+)$/);
  const id = match?.[1] && match[1] !== "_" ? match[1] : params.id !== "_" ? params.id : "";
  const collision = useCollisionStore((s) => s.getCollision(id));
  const { setForm, setEdit } = useCollisionFormStore();
  const router = useRouter();

  if (!collision) {
    return (
      <ScreenContainer title="Collision Not Found">
        <div className="card empty">
          <h3>Collision not found</h3>
          <p>This collision could not be found. It may have been deleted.</p>
          <p className="hint">Tap the button below to return to your collisions list</p>
        </div>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={() => router.push("/")}>
            Go Back
          </button>
        </div>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer title="View Collision">
      <CollisionInfoView collision={collision} />
      <div className="btn-row">
        <button type="button" className="btn btn-outline" onClick={() => downloadReport(collision)}>
          Download
        </button>
        <button type="button" className="btn btn-outline" onClick={() => openPrintReport(collision)}>
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
          Edit
        </button>
      </div>
      <button
        type="button"
        className="btn btn-outline"
        style={{ width: "100%", marginTop: "0.5rem" }}
        onClick={() => void shareReport(collision)}
      >
        Share
      </button>
    </ScreenContainer>
  );
}

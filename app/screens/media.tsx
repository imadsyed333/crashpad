"use client";

import { CollisionDraftButton } from "@/components/CollisionDraftButton";
import { MediaGrid, MediaOptions } from "@/components/Media";
import { ScreenContainer } from "@/components/ScreenContainer";
import { useNav, useSearch } from "@/lib/nav";
import { useCollisionFormStore } from "@/store/collisionFormStore";

export function MediaScreen() {
  const { collision, isEdit: storeIsEdit, commitEdit } = useCollisionFormStore();
  const router = useNav();
  const isEdit = useSearch().get("mode") === "edit";

  const next = () => {
    if (isEdit) {
      if (storeIsEdit) {
        const id = commitEdit();
        if (id) router.replace(`/collisions/${id}`);
      } else {
        router.back();
      }
    } else {
      router.push("/collisions/form/vehicles");
    }
  };

  return (
    <ScreenContainer
      title="Media"
      description="Provide as many photos and videos as you can of the collision."
      backHref={isEdit ? undefined : "/collisions/form/details"}
      footer={
        isEdit ? (
          <div className="btn-row">
            <button type="button" className="btn btn-primary" onClick={next}>
              Save Changes
            </button>
          </div>
        ) : (
          <div className="btn-row">
            <CollisionDraftButton />
            <button type="button" className="btn btn-primary" onClick={next}>
              Next
            </button>
          </div>
        )
      }
    >
      <MediaOptions />
      <div style={{ marginTop: "0.75rem" }}>
        <MediaGrid media={collision.media} showActions />
      </div>
    </ScreenContainer>
  );
}

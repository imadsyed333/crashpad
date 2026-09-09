"use client";

import { CollisionDraftButton } from "@/components/CollisionDraftButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { WitnessDialog, WitnessList } from "@/components/WitnessDialog";
import { useNav, useSearch } from "@/lib/nav";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useWitnessFormStore } from "@/store/witnessFormStore";
import { Plus } from "lucide-react";

export function WitnessesScreen() {
  const { resetForm, setDialogVisible, setEdit } = useWitnessFormStore();
  const { isEdit: storeIsEdit, commitEdit } = useCollisionFormStore();
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
      router.push("/collisions/form/review");
    }
  };

  return (
    <ScreenContainer
      title="Witnesses"
      description="Add witnesses present at the collision."
      backHref={isEdit ? undefined : "/collisions/form/vehicles"}
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
      <WitnessList />
      <WitnessDialog />
      <button
        type="button"
        className="fab"
        aria-label="Add witness"
        onClick={() => {
          resetForm();
          setEdit(false);
          setDialogVisible(true);
        }}
      >
        <Plus />
      </button>
    </ScreenContainer>
  );
}

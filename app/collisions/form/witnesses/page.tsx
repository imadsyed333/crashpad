"use client";

import { CollisionDraftButton } from "@/components/CollisionDraftButton";
import { ScreenContainer } from "@/components/ScreenContainer";
import { WitnessDialog, WitnessList } from "@/components/WitnessDialog";
import { useWitnessFormStore } from "@/store/witnessFormStore";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function WitnessesForm() {
  const { resetForm, setDialogVisible, setEdit } = useWitnessFormStore();
  const router = useRouter();
  const isEdit = useSearchParams().get("mode") === "edit";

  const next = () => {
    if (isEdit) router.back();
    else router.push("/collisions/form/review");
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
        +
      </button>
    </ScreenContainer>
  );
}

export default function WitnessesPage() {
  return (
    <Suspense>
      <WitnessesForm />
    </Suspense>
  );
}

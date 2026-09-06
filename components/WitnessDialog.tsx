"use client";

import { PHONE_MASK } from "@/lib/mask";
import { personSchema } from "@/lib/schemas";
import { useCollisionFormStore } from "@/store/collisionFormStore";
import { useWitnessFormStore } from "@/store/witnessFormStore";
import { useState } from "react";
import z from "zod";
import { Dialog } from "./Dialog";
import { Field } from "./Field";
import { MaskedInput } from "./MaskedInput";

export function WitnessCard({
  witness,
  index,
  showActions,
  onDelete,
}: {
  witness: { id: string; name: string; phoneNumber: string; address: string };
  index: number;
  showActions?: boolean;
  onDelete?: () => void;
}) {
  const { setForm, setEdit, setDialogVisible } = useWitnessFormStore();
  return (
    <article className="card">
      <div className="card-head">
        <h3 style={{ margin: 0 }}>Witness {index + 1}</h3>
        {showActions && (
          <div className="row-actions">
            <button
              type="button"
              className="icon-btn"
              aria-label="Edit witness"
              onClick={() => {
                setForm(witness);
                setEdit(true);
                setDialogVisible(true);
              }}
            >
              ✎
            </button>
            {onDelete && (
              <button
                type="button"
                className="icon-btn danger"
                aria-label="Delete witness"
                onClick={onDelete}
              >
                ⌫
              </button>
            )}
          </div>
        )}
      </div>
      <p><span className="bold">Name: </span>{witness.name}</p>
      <p><span className="bold">Phone: </span>{witness.phoneNumber}</p>
      <p><span className="bold">Address: </span>{witness.address}</p>
    </article>
  );
}

export function WitnessList() {
  const { collision, deleteWitness } = useCollisionFormStore();
  const [pending, setPending] = useState<string | null>(null);

  if (collision.witnesses.length === 0) {
    return (
      <>
        <div className="card empty">
          <h3>No witnesses added</h3>
          <p>You haven&apos;t added any witnesses to this collision yet.</p>
          <p className="hint">When needed, tap the + button below to add witness information</p>
        </div>
        <Dialog
          title="Delete Witness"
          message="Are you sure you want to delete this witness?"
          open={pending !== null}
          onSuccess={() => {
            if (pending) deleteWitness(pending);
            setPending(null);
          }}
          onCancel={() => setPending(null)}
        />
      </>
    );
  }

  return (
    <>
      {collision.witnesses.map((witness, index) => (
        <WitnessCard
          key={witness.id}
          witness={witness}
          index={index}
          showActions
          onDelete={() => setPending(witness.id)}
        />
      ))}
      <Dialog
        title="Delete Witness"
        message="Are you sure you want to delete this witness?"
        open={pending !== null}
        onSuccess={() => {
          if (pending) deleteWitness(pending);
          setPending(null);
        }}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

export function WitnessDialog() {
  const {
    witness,
    updateWitnessField,
    isEdit,
    isDialogVisible,
    setDialogVisible,
  } = useWitnessFormStore();
  const { addWitness, updateWitness } = useCollisionFormStore();
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});

  if (!isDialogVisible) return null;

  const close = () => {
    setDialogVisible(false);
    setErrors({});
  };

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <h2>Witness Information</h2>
        <Field
          label="Full Name"
          placeholder="e.g. Jane Smith"
          value={witness.name}
          error={errors.name}
          onChange={(e) => {
            updateWitnessField("name", e.target.value);
            setErrors({ ...errors, name: undefined });
          }}
        />
        <MaskedInput
          label="Phone Number"
          mask={PHONE_MASK}
          inputMode="tel"
          placeholder="e.g. (555) 123-4567"
          value={witness.phoneNumber}
          error={errors.phoneNumber}
          onChange={(phoneNumber) => {
            updateWitnessField("phoneNumber", phoneNumber);
            setErrors({ ...errors, phoneNumber: undefined });
          }}
        />
        <Field
          label="Address"
          placeholder="e.g. 123 Main St, Springfield"
          value={witness.address}
          error={errors.address}
          onChange={(e) => {
            updateWitnessField("address", e.target.value);
            setErrors({ ...errors, address: undefined });
          }}
        />
        <div className="btn-row">
          <button type="button" className="btn btn-outline" onClick={close}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              const parse = personSchema.safeParse({
                name: witness.name,
                address: witness.address,
                phoneNumber: witness.phoneNumber,
              });
              if (!parse.success) {
                setErrors(z.flattenError(parse.error).fieldErrors);
                return;
              }
              if (isEdit) updateWitness(witness);
              else addWitness(witness);
              close();
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import {FC, useState} from "react";
import ConfirmModal from "@/components/ConfirmModal";
import BrutalButton from "@/components/BrutalButton";

type Props = {
  sessionId: string;
  clubId: string;
  runnerId: string;
  distance: number | null;
  targetsHit: number;
  createdAt: string | Date;
  canManage: boolean;
  onUpdated: (session: {
    id: string;
    distance: number | null;
    targetsHit: number;
    createdAt: string | Date;
  }) => void;
  onDeleted: (sessionId: string) => void;
};

const hitOptions = [0, 1, 2, 3, 4, 5];

const ShotSessionRow: FC<Props> = ({
                                     sessionId,
                                     distance,
                                     targetsHit,
                                     createdAt,
                                     canManage,
                                     onUpdated,
                                     onDeleted,
                                   }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [distanceValue, setDistanceValue] = useState(
    distance != null ? String(distance) : ""
  );
  const [targetsHitValue, setTargetsHitValue] = useState(targetsHit);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    try {
      setLoading(true);

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distance: distanceValue === "" ? null : Number(distanceValue),
          targetsHit: targetsHitValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la modification");
      }

      const updatedSession = await response.json();

      onUpdated({
        id: updatedSession.id,
        distance: updatedSession.distance,
        targetsHit: updatedSession.targetsHit,
        createdAt: updatedSession.createdAt,
      });

      setIsEditing(false);
    } catch (error) {
      console.error(error);
      alert("Impossible de modifier la session");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    try {
      setLoading(true);

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression");
      }

      onDeleted(sessionId);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Impossible de supprimer la session");
    } finally {
      setLoading(false);
    }
  }

  if (isEditing) {
    return (
      <>
        <div className="rounded-2xl bg-[var(--card)] px-4 py-3">
          <div className="grid gap-3">
            <input
              type="number"
              step="0.1"
              value={distanceValue}
              onChange={(e) => setDistanceValue(e.target.value)}
              placeholder="Distance"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 outline-none"
            />

            <div className="flex flex-wrap gap-2">
              {hitOptions.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTargetsHitValue(value)}
                  className={`rounded-xl px-3 py-2 text-sm font-medium ${
                    targetsHitValue === value
                      ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                      : "border border-[var(--border)] bg-[var(--muted)]"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <BrutalButton
                type="button"
                onClickFn={handleSave}
                disabled={loading}
                label="Enregistrer"
              />
              <BrutalButton
                type="button"
                onClickFn={() => setIsEditing(false)}
                disabled={loading}
                label="Annuler"
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div
        className="flex flex-col gap-2 rounded-2xl bg-[var(--card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-medium">
          {distance != null ? `${distance} m` : "Distance non renseignée"}
        </div>

        <div className="text-[var(--muted-foreground)]">
          {targetsHit} cible{targetsHit > 1 ? "s" : ""} touchée
          {targetsHit > 1 ? "s" : ""}
        </div>

        <div className="text-sm text-[var(--muted-foreground)]">
          {new Date(createdAt).toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {canManage && (
          <div className="flex gap-2">
            <BrutalButton
              label="Modifier"
              type="button"
              onClickFn={() => setIsEditing(true)}
            />
            <BrutalButton
              label="Supprimer"
              type="button"
              onClickFn={() => setIsDeleteModalOpen(true)}
              variant="danger"
            />
          </div>
        )}
      </div>

      <ConfirmModal
        open={isDeleteModalOpen}
        title="Supprimer cette session ?"
        description="Cette action est définitive."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        loading={loading}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </>
  );
};

export default ShotSessionRow;
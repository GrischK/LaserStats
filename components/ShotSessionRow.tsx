"use client";

import {type Dispatch, FC, type SetStateAction, useState} from "react";
import {Pencil, Trash2} from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import BrutalButton from "@/components/BrutalButton";
import {Modal, ModalBody, ModalContent, useModal} from "@/components/ui/animated-modal";

type Props = {
  sessionId: string;
  clubId: string;
  runnerId: string;
  distance: number | null;
  targetsHit: number;
  durationSeconds: number | null;
  createdAt: string | Date;
  canManage: boolean;
  onUpdated: (session: {
    id: string;
    distance: number | null;
    targetsHit: number;
    durationSeconds: number | null;
    createdAt: string | Date;
  }) => void;
  onDeleted: (sessionId: string) => void;
};

const hitOptions = [0, 1, 2, 3, 4, 5];

function EditSessionButton() {
  const {setOpen} = useModal();

  return (
    <BrutalButton
      type="button"
      aria-label="Modifier la session"
      title="Modifier"
      onClickFn={() => setOpen(true)}
      variant="soft"
      className="h-11 min-h-11 w-11 p-0 sm:col-span-1"
    >
      <Pencil size={19} aria-hidden="true"/>
    </BrutalButton>
  );
}

type EditSessionModalContentProps = {
  distanceValue: string;
  setDistanceValue: Dispatch<SetStateAction<string>>;
  targetsHitValue: number;
  setTargetsHitValue: Dispatch<SetStateAction<number>>;
  durationSecondsValue: string;
  setDurationSecondsValue: Dispatch<SetStateAction<string>>;
  loading: boolean;
  onSave: (onSaved?: () => void) => Promise<void>;
};

function EditSessionModalContent({
                                   distanceValue,
                                   setDistanceValue,
                                   targetsHitValue,
                                   setTargetsHitValue,
                                   durationSecondsValue,
                                   setDurationSecondsValue,
                                   loading,
                                   onSave,
                                 }: EditSessionModalContentProps) {
  const {setOpen} = useModal();

  return (
    <ModalContent className="gap-4 p-5 sm:p-6">
      <div className="pr-8">
        <h3 className="text-xl font-extrabold tracking-tight">
          Modifier la session
        </h3>
        <p className="mt-1 text-sm font-medium text-[var(--muted-foreground)]">
          Ajuste uniquement les valeurs nécessaires.
        </p>
      </div>

      <div className="grid gap-4">
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--fg)]">
            Distance
          </span>
          <input
            type="number"
            step="0.1"
            min="0"
            value={distanceValue}
            onChange={(e) => setDistanceValue(e.target.value)}
            placeholder="Ex: 200 m"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 outline-none focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
          />
        </label>

        <div className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--fg)]">
            Cibles touchées
          </span>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {hitOptions.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setTargetsHitValue(value)}
                className={`min-h-11 rounded-lg px-3 py-2 text-base font-bold transition active:translate-y-px ${
                  targetsHitValue === value
                    ? "bg-[image:var(--selected-bg)] text-[var(--selected-foreground)]"
                    : "bg-[var(--surface-strong)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold text-[var(--fg)]">
            Temps
          </span>
          <input
            type="number"
            min="0"
            max="50"
            step="1"
            value={durationSecondsValue}
            onChange={(e) => setDurationSecondsValue(e.target.value)}
            placeholder="Secondes"
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 outline-none focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
          />
        </label>

        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          Laisser vide si non renseigné. Maximum 50 secondes.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <BrutalButton
          type="button"
          onClickFn={() => setOpen(false)}
          label="Annuler"
          variant="soft"
          className="sm:col-span-1"
          disabled={loading}
          fullWidth
        />
        <BrutalButton
          type="button"
          onClickFn={() => void onSave(() => setOpen(false))}
          disabled={loading}
          variant="primary"
          label={loading ? "Enregistrement..." : "Enregistrer"}
          fullWidth
        />
      </div>
    </ModalContent>
  );
}

const ShotSessionRow: FC<Props> = ({
                                     sessionId,
                                     distance,
                                     targetsHit,
                                     durationSeconds,
                                     createdAt,
                                     canManage,
                                     onUpdated,
                                     onDeleted,
                                   }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [distanceValue, setDistanceValue] = useState(
    distance != null ? String(distance) : ""
  );
  const [targetsHitValue, setTargetsHitValue] = useState(targetsHit);
  const [durationSecondsValue, setDurationSecondsValue] = useState(
    durationSeconds != null ? String(durationSeconds) : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSave(onSaved?: () => void) {
    const parsedDistance =
      distanceValue === "" ? null : Number(distanceValue);

    const parsedDuration =
      durationSecondsValue === "" ? null : Number(durationSecondsValue);

    if (
      parsedDistance !== null &&
      (!Number.isFinite(parsedDistance) || parsedDistance < 0)
    ) {
      alert("Distance invalide");
      return;
    }

    if (
      parsedDuration !== null &&
      (!Number.isInteger(parsedDuration) ||
        parsedDuration < 0 ||
        parsedDuration > 50)
    ) {
      alert("Le temps doit être un entier entre 0 et 50 secondes");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          distance: parsedDistance,
          targetsHit: targetsHitValue,
          durationSeconds: parsedDuration,
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
        durationSeconds: updatedSession.durationSeconds,
        createdAt: updatedSession.createdAt,
      });

      onSaved?.();
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

  return (
    <>
      <div
        className="bg-transparent px-3 py-3 sm:rounded-xl sm:border sm:border-[var(--border)] sm:bg-[var(--card)] sm:px-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-[var(--muted-foreground)]">
            Session
          </div>
          <div className="text-sm font-semibold text-[var(--muted-foreground)]">
            {new Date(createdAt).toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-[var(--history-stat)] px-3 py-2 ring-1 ring-inset ring-[var(--border)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Distance</div>
            <div className="mt-1 text-base font-bold">{distance != null ? `${distance} m` : "-"}</div>
          </div>
          <div className="rounded-lg bg-[var(--history-stat)] px-3 py-2 ring-1 ring-inset ring-[var(--border)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Cibles</div>
            <div className="mt-1 text-base font-bold text-[var(--accent-sport)]">{targetsHit}/5</div>
          </div>
          <div className="rounded-lg bg-[var(--history-stat)] px-3 py-2 ring-1 ring-inset ring-[var(--border)]">
            <div className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">Temps</div>
            <div className="mt-1 text-base font-bold">{durationSeconds != null ? `${durationSeconds} s` : "-"}</div>
          </div>
        </div>

        {canManage && (
          <div className="mt-3 flex justify-end gap-2">
            <Modal>
              <EditSessionButton/>
              <ModalBody
                className="w-[90%] sm:w-full mx-4 min-h-0 max-h-[90dvh] flex-none rounded-2xl border-[var(--border)] sm:max-w-md md:max-w-md">
                <EditSessionModalContent
                  distanceValue={distanceValue}
                  setDistanceValue={setDistanceValue}
                  targetsHitValue={targetsHitValue}
                  setTargetsHitValue={setTargetsHitValue}
                  durationSecondsValue={durationSecondsValue}
                  setDurationSecondsValue={setDurationSecondsValue}
                  loading={loading}
                  onSave={handleSave}
                />
              </ModalBody>
            </Modal>

            <button
              type="button"
              aria-label="Supprimer la session"
              title="Supprimer"
              onClick={() => setIsDeleteModalOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg bg-[image:var(--danger-gradient)] text-white transition hover:brightness-95 active:translate-y-px"
            >
              <Trash2 size={19} aria-hidden="true"/>
            </button>
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

"use client";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  label?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
                                       open,
                                       title,
                                       description,
                                       label = "Suppression...",
                                       confirmLabel = "Confirmer",
                                       cancelLabel = "Annuler",
                                       loading = false,
                                       onCancel,
                                       onConfirm,
                                     }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
        <h3 className="text-xl font-bold">{title}</h3>

        {description ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">
            {description}
          </p>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-2xl border border-[var(--border)] px-4 py-2 text-sm font-medium"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-2xl bg-[var(--danger)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading ? label : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
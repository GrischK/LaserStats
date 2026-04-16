"use client";

import {useEffect, useRef} from "react";
import {AnimatePresence, motion} from "motion/react";
import BrutalButton from "@/components/BrutalButton";
import {useOutsideClick} from "@/lib/use-outside-click";

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
  const modalRef = useRef<HTMLDivElement | null>(null);

  useOutsideClick(modalRef, () => {
    if (!loading) {
      onCancel();
    }
  }, open);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          initial={{opacity: 0}}
          animate={{opacity: 1, backdropFilter: "blur(10px)"}}
          exit={{opacity: 0, backdropFilter: "blur(0px)"}}
        >
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
          />

          <motion.div
            ref={modalRef}
            className="relative z-10 w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]"
            initial={{opacity: 0, scale: 0.92, y: 24}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.96, y: 12}}
            transition={{type: "spring", stiffness: 260, damping: 18}}
          >
            <h3 className="text-xl font-extrabold tracking-tight">{title}</h3>

            {description ? (
              <p className="mt-2 text-sm font-medium text-[var(--muted-foreground)]">
                {description}
              </p>
            ) : null}

            <div className="mt-6 grid gap-2 sm:grid-cols-2">
              <BrutalButton
                type="button"
                onClickFn={onCancel}
                label={cancelLabel}
                variant="soft"
                className="sm:col-span-1"
                fullWidth
              />

              <button
                disabled={loading}
                aria-label={loading ? label : confirmLabel}
                type="button"
                title={confirmLabel}
                onClick={onConfirm}
                className="flex min-h-12 items-center justify-center rounded-lg bg-[image:var(--danger-gradient)] text-white transition hover:brightness-95 active:translate-y-px"
              >
                Supprimer
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import type { ReactNode } from "react";

type Props = {
  label: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClickFn?: () => void;
  variant?: "default" | "primary" | "accent" | "secondary" | "ghost" | "danger";
  className?: string;
  fullWidth?: boolean;
  children?: ReactNode;
};

export default function BrutalButton({
                                       label,
                                       type = "button",
                                       disabled,
                                       onClickFn,
                                       variant = "default",
                                       className = "",
                                       fullWidth = false,
                                     }: Props) {

  const base =
    "inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition duration-150 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-sport)] active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55";

  const variants = {
    default:
      "border border-[var(--border)] bg-[var(--card)] text-[var(--fg)] hover:border-[var(--accent-sport)] hover:bg-[var(--muted)]",
    primary:
      "border border-transparent bg-[image:var(--primary-gradient)] text-[var(--primary-foreground)] hover:brightness-95",
    accent:
      "border border-transparent bg-[image:var(--accent-gradient)] text-[var(--accent-sport-foreground)] hover:brightness-95",
    secondary:
      "border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--fg)] hover:border-[var(--accent-sport)] hover:brightness-95",
    ghost:
      "border border-transparent bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--fg)]",
    danger:
      "border border-[var(--danger)] bg-[var(--danger)] text-white shadow-sm hover:bg-red-700",
  };

  return (
    <button
      disabled={disabled}
      type={type}
      onClick={onClickFn}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      {label}
    </button>
  );
}

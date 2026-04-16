"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import {cn} from "@/lib/utils";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  label?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClickFn?: () => void;
  variant?: "default" | "primary" | "accent" | "secondary" | "soft" | "ghost" | "danger";
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
                                       children,
                                       ...buttonProps
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
    soft:
      "button-soft-gradient border-2 border-transparent text-[var(--muted-foreground)] hover:text-[var(--fg)] hover:brightness-95",
    ghost:
      "border border-transparent bg-transparent text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--fg)]",
    danger:
      "border border-transparent bg-[image:var(--danger-gradient)] text-white shadow-sm hover:brightness-95",
  };

  return (
    <button
      {...buttonProps}
      disabled={disabled}
      type={type}
      onClick={onClickFn}
      className={cn(`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`)}
    >
      {label}
      {children}
    </button>
  );
}

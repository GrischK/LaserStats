"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import {cn} from "@/lib/utils";
import Link from "next/link";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  label?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClickFn?: () => void;
  variant?: "default" | "primary" | "accent" | "secondary" | "soft" | "ghost" | "danger";
  className?: string;
  fullWidth?: boolean;
  children?: ReactNode;
  href?: string;
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
                                       href,
                                       ...buttonProps
                                     }: Props) {

  const base =
    "inline-flex min-h-12 items-center justify-center rounded-lg px-5 py-3 !text-base !leading-6 font-semibold transition duration-150 hover:cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-sport)] active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-55";

  const variants = {
    default:
      "border border-[var(--border)] bg-[var(--card)] text-[color:var(--fg)] hover:border-[var(--accent-sport)] hover:bg-[var(--muted)]",
    primary:
      "border border-transparent bg-[image:var(--primary-gradient)] text-[color:var(--primary-foreground)] hover:brightness-95",
    accent:
      "border border-transparent bg-[image:var(--accent-gradient)] text-[color:var(--accent-sport-foreground)] hover:brightness-95",
    secondary:
      "border border-[var(--border)] bg-[var(--surface-strong)] text-[color:var(--fg)] hover:border-[var(--accent-sport)] hover:brightness-95",
    soft:
      "button-soft-gradient border-2 border-transparent text-[color:var(--muted-foreground)] hover:text-[color:var(--fg)] hover:brightness-95",
    ghost:
      "border border-transparent bg-transparent text-[color:var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[color:var(--fg)]",
    danger:
      "border border-transparent bg-[image:var(--danger-gradient)] text-white shadow-sm hover:brightness-95",
  };

  const classes = cn(`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {label}
        {children}
      </Link>
    );
  }

  return (
    <button
      {...buttonProps}
      disabled={disabled}
      type={type}
      onClick={onClickFn}
      className={classes}
    >
      {label}
      {children}
    </button>
  );
}

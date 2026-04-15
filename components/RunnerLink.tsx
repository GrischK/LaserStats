"use client";

import Link, {useLinkStatus} from "next/link";

type Props = {
  href: string;
  name: string;
  avatarUrl?: string | null;
};

function PendingIndicator() {
  const {pending} = useLinkStatus();

  return (
    <span
      className={`text-xs transition-opacity ${
        pending ? "opacity-100" : "opacity-0"
      }`}
    >
      Chargement...
    </span>
  );
}

export default function RunnerLink({href, name, avatarUrl}: Props) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition hover:border-[var(--accent-sport)] hover:bg-[var(--muted)] active:translate-y-px"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Avatar de ${name}`}
              className="h-10 w-10 rounded-full border border-[var(--border)] object-cover"
            />
          ) : null}
          <span className="font-semibold">{name}</span>
        </div>
        <PendingIndicator/>
      </div>
    </Link>
  );
}

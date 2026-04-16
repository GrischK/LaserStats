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
      className="runner-link-row relative block py-3 transition hover:bg-[var(--muted)] active:translate-y-px sm:rounded-xl sm:border sm:border-[var(--border)] sm:bg-[var(--card)] sm:p-4 sm:shadow-sm sm:hover:border-[var(--accent-sport)]"
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

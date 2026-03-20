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
      className="rounded-xl border p-3 transition hover:bg-gray-50 dark:hover:bg-zinc-900"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`Avatar de ${name}`}
              className="h-8 w-8 rounded-full border object-cover"
            />
          ) : null}
          <span>{name}</span>
        </div>
        <PendingIndicator/>
      </div>
    </Link>
  );
}

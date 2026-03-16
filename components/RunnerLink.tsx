"use client";

import Link, {useLinkStatus} from "next/link";

type Props = {
  href: string;
  name: string;
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

export default function RunnerLink({href, name}: Props) {
  return (
    <Link
      href={href}
      className="rounded-xl border p-3 transition hover:bg-gray-50 dark:hover:bg-zinc-900"
    >
      <div className="flex items-center justify-between gap-3">
        <span>{name}</span>
        <PendingIndicator/>
      </div>
    </Link>
  );
}
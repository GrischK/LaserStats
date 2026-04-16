"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type RunnerOption = {
  id: string;
  name: string;
};

type Props = {
  selectedRunnerId: string | null;
  runners: RunnerOption[];
};

export default function RunnerComparisonSelector({
  selectedRunnerId,
  runners,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (!value) {
      params.delete("compareRunnerId");
    } else {
      params.set("compareRunnerId", value);
    }

    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
      <label htmlFor="compare-runner" className="text-sm font-medium">
        Comparer avec un autre coureur
      </label>
      <select
        id="compare-runner"
        className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-3 text-sm font-medium text-[var(--fg)] outline-none focus:border-[var(--accent-sport)] focus:ring-2 focus:ring-[var(--accent-sport)]/20"
        value={selectedRunnerId ?? ""}
        onChange={(e) => handleChange(e.target.value)}
      >
        <option value="">Aucun</option>
        {runners.map((runner) => (
          <option key={runner.id} value={runner.id}>
            {runner.name}
          </option>
        ))}
      </select>
    </div>
  );
}

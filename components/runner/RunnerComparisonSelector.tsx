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
    <div className="rounded-2xl border bg-[var(--card)] p-4">
      <label htmlFor="compare-runner" className="text-sm font-medium">
        Comparer avec un autre coureur
      </label>
      <select
        id="compare-runner"
        className="mt-2 w-full rounded-xl border bg-[var(--card)] px-3 py-2 text-sm"
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

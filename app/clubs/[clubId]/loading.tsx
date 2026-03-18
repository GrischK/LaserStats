export default function LoadingClubPage() {
  return (
    <>
      <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
        <div className="h-10 w-52 animate-pulse rounded-2xl border bg-[var(--muted)]"/>
        <div className="h-10 w-52 animate-pulse rounded-2xl border bg-[var(--muted)]"/>
      </div>

      <div className="space-y-3">
        <div className="h-9 w-56 animate-pulse rounded bg-[var(--muted)]"/>
        <div className="h-4 w-24 animate-pulse rounded bg-[var(--muted)]"/>
      </div>

      <section className="rounded-2xl border p-4">
        <div className="mb-4 h-7 w-28 animate-pulse rounded bg-[var(--muted)]"/>
        <div className="grid gap-2">
          <div className="h-12 animate-pulse rounded-xl border bg-[var(--muted)]"/>
          <div className="h-12 animate-pulse rounded-xl border bg-[var(--muted)]"/>
          <div className="h-12 animate-pulse rounded-xl border bg-[var(--muted)]"/>
          <div className="h-12 animate-pulse rounded-xl border bg-[var(--muted)]"/>
        </div>
      </section>

      <div className="flex w-full items-center justify-center">
        <div className="h-10 w-48 animate-pulse rounded-2xl border bg-[var(--muted)]"/>
      </div>
    </>
  );
}
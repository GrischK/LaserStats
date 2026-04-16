type Props = {
  titleWidth?: string;
  rows?: number;
};

export default function PageLoading({
                                      titleWidth = "w-56",
                                      rows = 4,
                                    }: Props) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col sm:gap-6">
      <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-3xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
        <div className={`h-10 ${titleWidth} animate-pulse rounded-lg bg-[var(--muted)]`}/>
        <div className="mt-4 h-4 w-3/4 animate-pulse rounded bg-[var(--muted)]"/>
      </section>

      <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-2xl sm:border sm:p-4 sm:shadow-[var(--shadow)]">
        <div className="h-7 w-44 animate-pulse rounded bg-[var(--muted)]"/>
        <div className="mt-5 space-y-4">
          {Array.from({length: rows}).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-lg bg-[var(--muted)] sm:h-16"
            />
          ))}
        </div>
      </section>
    </main>
  );
}

export default function LoadingRunnerPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <div className="animate-pulse rounded-2xl border p-4">
        <div className="mb-3 h-8 w-48 rounded bg-gray-200 dark:bg-zinc-800"/>
        <div className="h-4 w-28 rounded bg-gray-200 dark:bg-zinc-800"/>
      </div>

      <div className="animate-pulse rounded-2xl border p-4">
        <div className="mb-4 h-6 w-32 rounded bg-gray-200 dark:bg-zinc-800"/>
        <div className="space-y-3">
          <div className="h-12 rounded bg-gray-200 dark:bg-zinc-800"/>
          <div className="h-12 rounded bg-gray-200 dark:bg-zinc-800"/>
          <div className="h-12 rounded bg-gray-200 dark:bg-zinc-800"/>
        </div>
      </div>
    </main>
  );
}
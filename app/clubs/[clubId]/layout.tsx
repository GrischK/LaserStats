export default function ClubLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl p-6">
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </main>
  );
}
export default function ClubLayout({
                                     children,
                                   }: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl">
      <div className="flex flex-col gap-5 sm:gap-6">
        {children}
      </div>
    </main>
  );
}

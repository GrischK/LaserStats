export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Laser Run Scores</h1>
        <p className="text-sm text-gray-600">
          Sélectionne un coureur pour enregistrer une série de tirs.
        </p>
      </div>

      <div className="rounded-2xl border p-4">
        <p>Prochaine étape. afficher les coureurs puis le formulaire d'ajout.</p>
      </div>
    </main>
  );
}
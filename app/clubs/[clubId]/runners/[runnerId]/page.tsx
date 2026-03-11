import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";

type Props = {
  params: Promise<{ clubId: string; runnerId: string }>;
};

export default async function RunnerPage({params}: Props) {
  const {clubId, runnerId} = await params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {email: session.user.email},
    include: {memberships: true},
  });

  if (!user) {
    redirect("/login");
  }

  const membership = user.memberships.find((m) => m.clubId === clubId);

  if (!membership) {
    redirect("/dashboard");
  }

  const runner = await prisma.runner.findFirst({
    where: {
      id: runnerId,
      clubId,
      active: true,
    },
  });

  if (!runner) {
    redirect(`/clubs/${clubId}`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">{runner.name}</h1>
        <p className="text-sm text-gray-600">Club ID : {clubId}</p>
      </div>

      <div className="rounded-2xl border p-4">
        Ici on ajoutera bientôt le formulaire de session de tir.
      </div>
    </main>
  );
}
import Link from "next/link";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";

type Props = {
  params: Promise<{ clubId: string }>;
};

export default async function ClubPage({params}: Props) {
  const {clubId} = await params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {email: session.user.email},
    include: {
      memberships: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const membership = user.memberships.find((m) => m.clubId === clubId);

  if (!membership) {
    redirect("/dashboard");
  }

  const club = await prisma.club.findUnique({
    where: {id: clubId},
    include: {
      runners: {
        where: {active: true},
        orderBy: {name: "asc"},
      },
    },
  });

  if (!club) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 p-6">
      {(membership.role === "ADMIN" || membership.role === "COACH") && (
        <div>
          <Link
            href={`/clubs/${clubId}/associations`}
            className="rounded-xl border px-4 py-2 text-sm font-medium"
          >
            Gérer les associations
          </Link>
          <Link
            href={`/clubs/${clubId}/settings`}
            className="rounded-xl border px-4 py-2"
          >
            Inviter un coureur
          </Link>
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <p className="text-sm text-gray-600">Rôle : {membership.role}</p>
        </div>

        {(membership.role === "ADMIN" || membership.role === "COACH") && (
          <Link
            href={`/clubs/${clubId}/add-runner`}
            className="rounded-xl border px-4 py-2"
          >
            Ajouter un coureur
          </Link>
        )}
      </div>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-xl font-semibold">Coureurs</h2>

        {club.runners.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun coureur pour le moment.</p>
        ) : (
          <div className="grid gap-2">
            {club.runners.map((runner) => (
              <Link
                key={runner.id}
                href={`/clubs/${clubId}/runners/${runner.id}`}
                className="rounded-xl border p-3 transition hover:bg-gray-50"
              >
                {runner.name}
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
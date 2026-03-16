import Link from "next/link";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";
import BrutalButton from "@/components/BrutalButton";
import type {
  ClubWithActiveRunners,
  Membership,
  UserWithMemberships,
} from "@/lib/types";

type Props = {
  params: Promise<{ clubId: string }>;
};

export default async function ClubPage({params}: Props) {
  const {clubId} = await params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user: UserWithMemberships | null = await prisma.user.findUnique({
    where: {email: session.user.email},
    include: {
      memberships: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const membership = user.memberships.find(
    (m: Membership) => m.clubId === clubId
  );

  if (!membership) {
    redirect("/dashboard");
  }

  const club: ClubWithActiveRunners | null = await prisma.club.findUnique({
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
        <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
          <Link href={`/clubs/${clubId}/associations`}>
            <BrutalButton label="Gérer les associations"/>
          </Link>

          <Link href={`/clubs/${clubId}/settings`}>
            <BrutalButton label="Inviter un coureur"/>
          </Link>
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <div>
          <h1 className="text-3xl font-bold">{club.name}</h1>
          <p className="text-sm text-gray-600">Rôle : {membership.role}</p>
        </div>
      </div>

      <section className="rounded-2xl border p-4">
        <h2 className="mb-3 text-xl font-semibold">Coureurs</h2>

        {club.runners.length === 0 ? (
          <p className="text-sm text-gray-600">Aucun coureur pour le moment.</p>
        ) : (
          <div className="grid gap-2">
            {club.runners.map((runner: ClubWithActiveRunners["runners"][number]) => (
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

      <div className="flex w-full items-center justify-center">
        {(membership.role === "ADMIN" || membership.role === "COACH") && (
          <Link href={`/clubs/${clubId}/add-runner`}>
            <BrutalButton label="Ajouter un coureur"/>
          </Link>
        )}
      </div>
    </main>
  );
}
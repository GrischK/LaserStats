import Link from "next/link";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";
import BrutalButton from "@/components/BrutalButton";
import RunnerLink from "@/components/RunnerLink";

type Props = {
  params: Promise<{ clubId: string }>;
};
export default async function ClubPage({params}: Props) {
  const {clubId} = await params;
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId: session.user.id,
        clubId,
      },
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  const club = await prisma.club.findUnique({
    where: {id: clubId},
    include: {
      runners: {
        where: {active: true},
        include: {
          user: {
            select: {
              image: true,
            },
          },
        },
        orderBy: {name: "asc"},
      },
    },
  });

  if (!club) {
    redirect("/dashboard");
  }

  return (
    <>
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
            {club.runners.map((runner) => (
              <RunnerLink
                key={runner.id}
                href={`/clubs/${clubId}/runners/${runner.id}`}
                name={runner.name}
                avatarUrl={runner.user?.image ?? null}
              />
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
    </>
  );
}

import Link from "next/link";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";
import BrutalButton from "@/components/BrutalButton";
import RunnerLink from "@/components/RunnerLink";
import ClubActionsDropdown from "@/components/club/ClubActionsDropdown";

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
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{club.name}</h1>
          <p className="text-sm font-medium text-[var(--muted-foreground)]">Rôle : {membership.role}</p>
        </div>
        {(membership.role === "ADMIN" || membership.role === "COACH") && (
          <div className="w-full md:w-auto">
            <ClubActionsDropdown clubId={clubId}/>
          </div>
        )}
      </div>

      <section className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-[var(--shadow)]">
        <h2 className="mb-3 text-xl font-semibold">Coureurs</h2>

        {club.runners.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">Aucun coureur pour le moment.</p>
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

      <div className="mt-4 flex w-full items-center justify-center">
        {(membership.role === "ADMIN" || membership.role === "COACH") && (
          <Link href={`/clubs/${clubId}/add-runner`} className="w-full sm:w-auto">
            <BrutalButton label="Ajouter un coureur" variant="primary" fullWidth/>
          </Link>
        )}
      </div>
    </>
  );
}

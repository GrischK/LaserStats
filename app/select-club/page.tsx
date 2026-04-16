import Link from "next/link";
import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";
import type {UserWithMembershipsAndClub} from "@/lib/types";

export default async function SelectClubPage() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user: UserWithMembershipsAndClub | null = await prisma.user.findUnique({
    where: {email: session.user.email},
    include: {
      memberships: {
        include: {
          club: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  if (user.memberships.length === 0) {
    redirect("/create-club");
  }

  if (user.memberships.length === 1) {
    redirect(`/clubs/${user.memberships[0].clubId}`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-4 sm:p-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Choisir un club</h1>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">
          Tu fais partie de plusieurs clubs.
        </p>
      </div>

      <div className="grid gap-3">
        {user.memberships.map(
          (membership: UserWithMembershipsAndClub["memberships"][number]) => (
            <Link
              key={membership.id}
              href={`/clubs/${membership.clubId}`}
              className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm transition hover:border-[var(--accent-sport)] hover:bg-[var(--muted)] active:translate-y-px"
            >
              <div className="text-lg font-semibold">{membership.club.name}</div>
              <div className="text-sm text-[var(--muted-foreground)]">{membership.role}</div>
            </Link>
          )
        )}
      </div>
    </main>
  );
}

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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Choisir un club</h1>
        <p className="text-sm text-gray-600">
          Tu fais partie de plusieurs clubs.
        </p>
      </div>

      <div className="grid gap-3">
        {user.memberships.map(
          (membership: UserWithMembershipsAndClub["memberships"][number]) => (
            <Link
              key={membership.id}
              href={`/clubs/${membership.clubId}`}
              className="rounded-2xl border p-4 transition hover:bg-gray-50"
            >
              <div className="text-lg font-semibold">{membership.club.name}</div>
              <div className="text-sm text-gray-500">{membership.role}</div>
            </Link>
          )
        )}
      </div>
    </main>
  );
}
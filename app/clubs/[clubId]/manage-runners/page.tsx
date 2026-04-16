import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/session";
import ManageRunnersSection from "@/components/club/ManageRunnersSection";

type Props = {
  params: Promise<{ clubId: string }>;
};

export default async function ManageRunnersPage({ params }: Props) {
  const { clubId } = await params;
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_clubId: {
        userId: session.user.id,
        clubId,
      },
    },
    select: {
      role: true,
    },
  });

  if (!membership) {
    redirect("/dashboard");
  }

  if (membership.role !== "ADMIN" && membership.role !== "COACH") {
    redirect(`/clubs/${clubId}`);
  }

  const runners = await prisma.runner.findMany({
    where: {
      clubId,
      active: true,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
      _count: {
        select: {
          sessions: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col sm:gap-6">
      <h1>
        Gérer les coureurs
      </h1>
      <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-3xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Renommez ou retirez les coureurs actifs du club.
        </p>
      </section>
      <ManageRunnersSection clubId={clubId} initialRunners={runners} />
    </main>
  );
}

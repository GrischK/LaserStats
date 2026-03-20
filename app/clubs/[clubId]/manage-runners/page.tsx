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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6">
      <ManageRunnersSection clubId={clubId} initialRunners={runners} />
    </main>
  );
}

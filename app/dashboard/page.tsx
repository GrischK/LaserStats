import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";

export default async function DashboardPage() {
  const session = await getAuthSession();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
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

  redirect("/select-club");
}
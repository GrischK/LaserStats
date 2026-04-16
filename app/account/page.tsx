import {redirect} from "next/navigation";
import {prisma} from "@/lib/prisma";
import {getAuthSession} from "@/lib/session";
import ProfileForm from "@/components/account/ProfileForm";
import PasswordForm from "@/components/account/PasswordForm";
import DeleteAccountSection from "@/components/account/DeleteAccountSection";

export default async function AccountPage() {
  const session = await getAuthSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {id: session.user.id},
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      password: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto max-w-3xl sm:space-y-6">
      <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 pb-10 sm:mx-0 sm:rounded-3xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
        <h1 className="text-3xl font-bold tracking-tight">Compte</h1>
        <p className="mt-2 text-[var(--muted-foreground)]">
          Gérez votre profil, votre mot de passe et votre compte.
        </p>
      </section>

      <ProfileForm
        initialName={user.name ?? ""}
        initialEmail={user.email}
        initialImage={user.image ?? ""}
      />

      <PasswordForm hasPassword={Boolean(user.password)}/>

      <DeleteAccountSection/>
    </main>
  );
}

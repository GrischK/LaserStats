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
      <section className="-mx-4 border-b border-[var(--border)] bg-[var(--card)] px-4 py-10 sm:mx-0 sm:rounded-3xl sm:border sm:p-6 sm:shadow-[var(--shadow)]">
        <p className="text-sm font-extrabold uppercase tracking-wide text-[var(--accent-sport)]">
          Compte
        </p>
        <div className="mt-2 flex items-center gap-3">
          {user?.image ? (
            <img
              src={user.image}
              alt={`Avatar de ${user.name}`}
              className="h-12 w-12 rounded-full border border-[var(--border)] object-cover"
            />
          ) : null}
          <h1 className="min-w-0 break-words text-4xl font-black leading-tight tracking-tight">{user.name}</h1>
        </div>
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

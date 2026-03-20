import HeroSectionOne from "@/components/hero-section-demo-1";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getAuthSession();

  if (session?.user?.id) {
    redirect("/dashboard");
  }

  return (
    <HeroSectionOne/>
  );
}

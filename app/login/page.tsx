import HeroSectionTwo from "@/components/hero-section-2";

type Props = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { callbackUrl } = await searchParams;

  return (
    <HeroSectionTwo
      callbackUrl={callbackUrl || "/dashboard"}
      autoOpenAuth={true}
    />
  );
}
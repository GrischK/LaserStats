import RegisterForm from "@/components/RegisterForm";

export default async function RegisterPage({
                                             searchParams,
                                           }: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const {callbackUrl} = await searchParams;

  return <RegisterForm callbackUrl={callbackUrl ?? "/dashboard"}/>;
}
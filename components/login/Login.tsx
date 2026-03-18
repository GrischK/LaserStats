import {Suspense} from "react";
import LoginPageContent from "./LoginPageContent";

type Props = {
  callbackUrl?: string;
};

export default function LoginPage({callbackUrl}: Props) {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <LoginPageContent callbackUrl={callbackUrl}/>
    </Suspense>
  );
}
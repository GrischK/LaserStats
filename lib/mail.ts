import {Resend} from "resend";
import type {ClubRole} from "@/lib/types";

const resend = new Resend(process.env.RESEND_API_KEY);

function roleLabel(role: ClubRole) {
  if (role === "ADMIN") return "Admin";
  if (role === "COACH") return "Coach";
  return "Utilisateur";
}

export async function sendClubInvitationEmail(params: {
  to: string;
  clubName: string;
  role: ClubRole;
  token: string;
}) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY manquant");
  }

  if (!process.env.MAIL_FROM) {
    throw new Error("MAIL_FROM manquant");
  }

  if (!process.env.NEXT_PUBLIC_APP_URL) {
    throw new Error("NEXT_PUBLIC_APP_URL manquant");
  }

  const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${params.token}`;

  const response = await resend.emails.send({
    from: process.env.MAIL_FROM,
    to: params.to,
    subject: `Invitation à rejoindre ${params.clubName}`,
    html: `
      <h2>Invitation à rejoindre ${params.clubName}</h2>
      <p>Rôle : ${roleLabel(params.role)}</p>
      <p><a href="${inviteUrl}">Rejoindre le club</a></p>
    `,
    text: `Invitation à rejoindre ${params.clubName} (${roleLabel(params.role)}) : ${inviteUrl}`,
  });

  if (response.error) {
    console.error("RESEND ERROR:", response.error);
    throw new Error(response.error.message);
  }

  console.log("RESEND OK:", response.data);

  return response.data;
}
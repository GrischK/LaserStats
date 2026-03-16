import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import type { ClubRole } from "@/lib/types";

const mailersend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY!,
});

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
  try {
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${params.token}`;

    const sentFrom = new Sender(process.env.MAIL_FROM!, "LaserStats");
    const recipients = [new Recipient(params.to)];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(`Invitation à rejoindre ${params.clubName}`)
      .setHtml(`
        <h2>Invitation à rejoindre ${params.clubName}</h2>
        <p>Rôle : ${roleLabel(params.role)}</p>
        <p><a href="${inviteUrl}">Rejoindre le club</a></p>
      `)
      .setText(`Invitation à rejoindre ${params.clubName} : ${inviteUrl}`);

    const response = await mailersend.email.send(emailParams);

    console.log("MAILERSEND OK:", response);

    return response;
  } catch (error) {
    console.error("MAILERSEND ERROR:", error);
    throw error;
  }
}
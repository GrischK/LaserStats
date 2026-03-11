import {randomBytes} from "crypto";

export function generateInviteToken() {
  return randomBytes(32).toString("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getInvitationExpirationDate() {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
}
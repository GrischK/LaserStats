import type {ClubRole} from "@/lib/types";

export function canInviteRole(
  inviterRole: ClubRole,
  targetRole: ClubRole
): boolean {
  if (inviterRole === "ADMIN") {
    return targetRole === "COACH" || targetRole === "USER";
  }

  if (inviterRole === "COACH") {
    return targetRole === "USER";
  }

  return false;
}

export function getInvitableRoles(inviterRole: ClubRole): ClubRole[] {
  if (inviterRole === "ADMIN") {
    return ["COACH", "USER"];
  }

  if (inviterRole === "COACH") {
    return ["USER"];
  }

  return [];
}
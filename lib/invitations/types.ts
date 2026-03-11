export type ClubRole = "ADMIN" | "COACH" | "USER";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export type ClubInvitationItem = {
  id: string;
  email: string;
  role: ClubRole;
  status: InvitationStatus;
  createdAt: Date;
  expiresAt: Date;
  invitedBy: {
    id: string;
    name: string | null;
    email: string;
  } | null;
};

export type InvitationDetails = {
  id: string;
  email: string;
  role: ClubRole;
  status: InvitationStatus;
  expiresAt: Date;
  club: {
    id: string;
    name: string;
  };
  invitedBy: {
    id: string;
    name: string | null;
    email: string;
  };
};
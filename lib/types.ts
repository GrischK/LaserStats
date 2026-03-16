import type {Membership, Prisma} from "@prisma/client";

export type ClubRole = "ADMIN" | "COACH" | "USER";
export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";
export type {Membership};

export type ClubInvitationItem = {
  id: string;
  email: string;
  role: ClubRole;
  status: InvitationStatus;
  token: string;
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

export type UserWithMemberships = Prisma.UserGetPayload<{
  include: { memberships: true };
}>;

export type LinkedRunner = Prisma.RunnerGetPayload<{
  select: {
    id: true;
    name: true;
    active: true;
    createdAt: true;
    userId: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    _count: {
      select: {
        sessions: true;
      };
    };
  };
}>;

export type UnlinkedRunner = Prisma.RunnerGetPayload<{
  select: {
    id: true;
    name: true;
    active: true;
    createdAt: true;
    _count: {
      select: {
        sessions: true;
      };
    };
  };
}>;

export type AvailableMember = Prisma.MembershipGetPayload<{
  select: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    role: true;
  };
}>;

export type ClubWithActiveRunners = Prisma.ClubGetPayload<{
  include: {
    runners: true;
  };
}>;

export type RunnerWithSessions = Prisma.RunnerGetPayload<{
  include: {
    sessions: true;
  };
}>;

export type UserWithMembershipsAndClub = Prisma.UserGetPayload<{
  include: {
    memberships: {
      include: {
        club: true;
      };
    };
  };
}>;

export type InvitationListItem = Prisma.InvitationGetPayload<{
  select: {
    id: true;
    email: true;
    role: true;
    status: true;
    token: true;
    createdAt: true;
    expiresAt: true;
    invitedBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;
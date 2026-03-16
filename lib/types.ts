import type {Prisma} from "@prisma/client";

export type ClubRole = "ADMIN" | "COACH" | "USER";

export type InvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "EXPIRED"
  | "CANCELLED";

export type Membership = Prisma.MembershipGetPayload<{}>;

export type UserWithMemberships = Prisma.UserGetPayload<{
  include: {
    memberships: true;
  };
}>;

export type UserWithMembershipsAndClub = Prisma.UserGetPayload<{
  include: {
    memberships: {
      include: {
        club: {
          select: {
            id: true;
            name: true;
          };
        };
      };
    };
  };
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
    role: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
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

export type ClubInvitationItem = Prisma.InvitationGetPayload<{
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

export type InvitationDetails = Prisma.InvitationGetPayload<{
  include: {
    club: {
      select: {
        id: true;
        name: true;
      };
    };
    invitedBy: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;
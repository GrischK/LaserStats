import type {Prisma} from "@prisma/client";

export type ClubRole = "ADMIN" | "COACH" | "USER";

export type InvitationStatus =
  | "PENDING"
  | "ACCEPTED"
  | "EXPIRED"
  | "CANCELLED";

export type Membership = Prisma.MembershipGetPayload<object>;

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
  include: {
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
  include: {
    _count: {
      select: {
        sessions: true;
      };
    };
  };
}>;

export type AvailableMember = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  role: ClubRole;
};

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
  include: {
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
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

export type ClubMemberItem = {
  userId: string;
  role: ClubRole;
  createdAt: Date;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
};

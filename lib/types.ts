export type ClubRole = "ADMIN" | "COACH" | "USER";

export type InvitationStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "CANCELLED";

export type Membership = {
  id: string;
  userId: string;
  clubId: string;
  role: ClubRole;
  createdAt: Date;
  updatedAt: Date;
};

export type UserWithMemberships = {
  id: string;
  email: string;
  memberships: Membership[];
};

export type UserWithMembershipsAndClub = {
  id: string;
  email: string;
  memberships: Array<
    Membership & {
    club: {
      id: string;
      name: string;
    };
  }
  >;
};

export type LinkedRunner = {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  userId: string | null;
  user: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  _count: {
    sessions: number;
  };
};

export type UnlinkedRunner = {
  id: string;
  name: string;
  active: boolean;
  createdAt: Date;
  _count: {
    sessions: number;
  };
};

export type AvailableMember = {
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  role: ClubRole;
};

export type ClubWithActiveRunners = {
  id: string;
  name: string;
  runners: Array<{
    id: string;
    name: string;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
    clubId: string;
    userId: string | null;
  }>;
};

export type RunnerWithSessions = {
  id: string;
  name: string;
  active: boolean;
  clubId: string;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  sessions: Array<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    distance: number | null;
    targetsHit: number;
    runnerId: string;
    sessionDay: Date;
  }>;
};

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
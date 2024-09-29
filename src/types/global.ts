export const ROUTE_TYPES = {
  FAMILY: "family",
  LONG: "long",
  SHORT: "short",
} as const;

export type RouteType = (typeof ROUTE_TYPES)[keyof typeof ROUTE_TYPES];

export const TEAM_STATUSES = {
  NOT_STARTED: "not started",
  IN_PROGRESS: "in progress",
  WARNING: "warning",
  DANGEROUS: "dangerous",
  FINISHED: "finished",
} as const;

export type TeamStatus = (typeof TEAM_STATUSES)[keyof typeof TEAM_STATUSES];

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TeamData {
  id: number;
  dorsal: number;
  name: string;
  route: RouteType;
  status: TeamStatus;
  routeCoordinates: Coordinate[];
}

export interface RouteData {
  id: number;
  type: RouteType;
  coordinates: Coordinate[];
}

export interface ErrorWithMessage {
  message: string;
  stack?: string;
}

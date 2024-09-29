import {
  RouteType,
  TeamStatus,
  ROUTE_TYPES,
  TEAM_STATUSES,
} from "@/types/global";

export const getRouteColor = (route: RouteType): string => {
  switch (route) {
    case ROUTE_TYPES.FAMILY:
      return "teal";
    case ROUTE_TYPES.SHORT:
      return "gold";
    case ROUTE_TYPES.LONG:
      return "violet";
    default:
      return "blue";
  }
};

export const getRouteDisplayName = (route: RouteType): string => {
  switch (route) {
    case ROUTE_TYPES.FAMILY:
      return "Familiar";
    case ROUTE_TYPES.SHORT:
      return "Corta";
    case ROUTE_TYPES.LONG:
      return "Larga";
    default:
      return route;
  }
};

export const getStatusColor = (status: TeamStatus): string => {
  switch (status) {
    case TEAM_STATUSES.DANGEROUS:
      return "red";
    case TEAM_STATUSES.WARNING:
      return "orange";
    case TEAM_STATUSES.IN_PROGRESS:
      return "green";
    default:
      return "inherit";
  }
};

export const getStatusDisplayName = (status: TeamStatus): string => {
  switch (status) {
    case TEAM_STATUSES.NOT_STARTED:
      return "No iniciado";
    case TEAM_STATUSES.IN_PROGRESS:
      return "En progreso";
    case TEAM_STATUSES.WARNING:
      return "Advertencia";
    case TEAM_STATUSES.DANGEROUS:
      return "Peligro";
    case TEAM_STATUSES.FINISHED:
      return "Finalizado";
    default:
      return status;
  }
};

export const getStatusIcon = (status: TeamStatus): string => {
  switch (status) {
    case TEAM_STATUSES.NOT_STARTED:
      return "🔵";
    case TEAM_STATUSES.IN_PROGRESS:
      return "🟢";
    case TEAM_STATUSES.WARNING:
      return "🟠";
    case TEAM_STATUSES.DANGEROUS:
      return "🔴";
    case TEAM_STATUSES.FINISHED:
      return "✅";
    default:
      return "⚪";
  }
};

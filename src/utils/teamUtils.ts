import { TeamData } from "../utils/api";

export const getRouteColor = (route: TeamData["route"]): string => {
  switch (route) {
    case "family":
      return "teal";
    case "short":
      return "gold";
    case "long":
      return "violet";
    default:
      return "blue";
  }
};

export const getRouteDisplayName = (route: TeamData["route"]): string => {
  switch (route) {
    case "family":
      return "Familiar";
    case "short":
      return "Corta";
    case "long":
      return "Larga";
    default:
      return route;
  }
};

export const getStatusColor = (status: TeamData["status"]): string => {
  switch (status) {
    case "dangerous":
      return "red";
    case "warning":
      return "orange";
    case "in progress":
      return "green";
    default:
      return "inherit";
  }
};

export const getStatusDisplayName = (status: TeamData["status"]): string => {
  switch (status) {
    case "not started":
      return "No iniciado";
    case "in progress":
      return "En progreso";
    case "warning":
      return "Advertencia";
    case "dangerous":
      return "Peligro";
    case "finished":
      return "Finalizado";
    default:
      return status;
  }
};

export const getStatusIcon = (status: TeamData["status"]): string => {
  switch (status) {
    case "not started":
      return "🔵";
    case "in progress":
      return "🟢";
    case "warning":
      return "🟠";
    case "dangerous":
      return "🔴";
    case "finished":
      return "✅";
    default:
      return "⚪";
  }
};

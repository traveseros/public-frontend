import React from "react";
import styles from "../styles/LegendFilter.module.css";
import { TeamData } from "../utils/api";

interface LegendFilterProps {
  teams: TeamData[];
  selectedTeam: TeamData | null;
  onTeamClick: (team: TeamData) => void;
  routeFilter: string;
  statusFilter: string;
  onRouteFilterChange: (route: string) => void;
  onStatusFilterChange: (status: string) => void;
}

const LegendFilter: React.FC<LegendFilterProps> = ({
  teams,
  selectedTeam,
  onTeamClick,
  routeFilter,
  statusFilter,
  onRouteFilterChange,
  onStatusFilterChange,
}) => {
  const getRouteColor = (route: TeamData["route"]): string => {
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

  const getStatusIcon = (status: TeamData["status"]): string => {
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

  const getRouteDisplayName = (route: TeamData["route"]): string => {
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

  const getStatusDisplayName = (status: TeamData["status"]): string => {
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

  const filteredTeams = teams.filter(
    (team) =>
      (routeFilter === "all" || team.route === routeFilter) &&
      (statusFilter === "all" || team.status === statusFilter)
  );

  return (
    <div className={styles.legend}>
      <div className={styles.filters}>
        <select
          value={routeFilter}
          onChange={(e) => onRouteFilterChange(e.target.value)}
        >
          <option value="all">Todas las rutas</option>
          <option value="family">Familiar</option>
          <option value="short">Corta</option>
          <option value="long">Larga</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          <option value="all">Todos los estados</option>
          <option value="not started">No iniciado</option>
          <option value="in progress">En progreso</option>
          <option value="warning">Advertencia</option>
          <option value="dangerous">Peligro</option>
          <option value="finished">Finalizado</option>
        </select>
      </div>
      <ul className={styles.teamList}>
        {filteredTeams.map((team) => (
          <li
            key={team.id}
            onClick={() => onTeamClick(team)}
            className={`${styles.teamItem} ${
              selectedTeam && selectedTeam.id === team.id ? styles.selected : ""
            }`}
            style={{ borderLeft: `4px solid ${getRouteColor(team.route)}` }}
          >
            <div className={styles.teamInfo}>
              <span
                className={styles.teamName}
                title={`${team.dorsal} - ${team.name}`}
              >
                {team.dorsal} - {team.name}
              </span>
              <span className={styles.teamRoute}>
                ({getRouteDisplayName(team.route)})
              </span>
            </div>
            <span
              className={styles.teamStatus}
              title={getStatusDisplayName(team.status)}
            >
              {getStatusIcon(team.status)} {getStatusDisplayName(team.status)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LegendFilter;

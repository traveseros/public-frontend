import React from "react";
import styles from "../styles/TeamList.module.css";
import { TeamData } from "../utils/api";
import {
  getRouteColor,
  getRouteDisplayName,
  getStatusDisplayName,
  getStatusIcon,
} from "../utils/teamUtils";

interface TeamListProps {
  teams: TeamData[];
  selectedTeam: TeamData | null;
  onTeamClick: (team: TeamData) => void;
  routeFilters: string[];
  statusFilters: string[];
}

const TeamList: React.FC<TeamListProps> = ({
  teams,
  selectedTeam,
  onTeamClick,
  routeFilters,
  statusFilters,
}) => {
  const filteredTeams = teams.filter(
    (team) =>
      routeFilters.length > 0 &&
      routeFilters.includes(team.route) &&
      statusFilters.length > 0 &&
      statusFilters.includes(team.status)
  );

  if (
    filteredTeams.length === 0 ||
    routeFilters.length === 0 ||
    statusFilters.length === 0
  ) {
    return (
      <div className={`${styles.legend} ${styles.noData}`}>
        No hay equipos que mostrar con esos filtros.
      </div>
    );
  }

  return (
    <div className={styles.legend}>
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

export default TeamList;

import React, { useEffect, useRef } from "react";
import styles from "../styles/TeamList.module.css";
import { TeamData, RouteType, TeamStatus } from "@/types/global";
import {
  getRouteColor,
  getRouteDisplayName,
  getStatusDisplayName,
  getStatusIcon,
} from "../app/lib/teams/utils";

interface TeamListProps {
  teams: TeamData[];
  selectedTeamId: number | null;
  onTeamSelect: (teamId: number) => void;
  routeFilters: RouteType[];
  statusFilters: TeamStatus[];
}

const TeamList: React.FC<TeamListProps> = ({
  teams,
  selectedTeamId,
  onTeamSelect,
  routeFilters,
  statusFilters,
}) => {
  const listRef = useRef<HTMLUListElement>(null);
  const selectedItemRef = useRef<HTMLLIElement>(null);

  const filteredTeams = teams.filter(
    (team) =>
      routeFilters.includes(team.route) && statusFilters.includes(team.status)
  );

  useEffect(() => {
    if (selectedTeamId && selectedItemRef.current && listRef.current) {
      selectedItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [selectedTeamId]);

  const renderContent = () => {
    if (routeFilters.length === 0 || statusFilters.length === 0) {
      return (
        <div className={styles.noData}>
          Por favor, seleccione al menos un filtro de ruta y un filtro de estado
          para ver los equipos.
        </div>
      );
    }

    if (filteredTeams.length === 0) {
      return (
        <div className={styles.noData}>
          No hay equipos que coincidan con los filtros seleccionados.
        </div>
      );
    }

    return (
      <ul className={styles.teamList} ref={listRef}>
        {filteredTeams.map((team) => {
          const routeColor = getRouteColor(team.route);
          return (
            <li
              key={team.id}
              ref={selectedTeamId === team.id ? selectedItemRef : null}
              onClick={() => onTeamSelect(team.id)}
              className={`${styles.teamItem} ${
                selectedTeamId === team.id ? styles.selected : ""
              }`}
              style={{
                borderLeft: `4px solid ${routeColor}`,
                boxShadow: `inset 0 0 5px ${routeColor}`,
              }}
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
          );
        })}
      </ul>
    );
  };

  return (
    <div className={styles.legend}>
      <div className={styles.fixedHeader}>
        <h3 className={styles.teamCount}>
          {"Mostrando "}
          {filteredTeams.length}{" "}
          {filteredTeams.length === 1 ? "equipo" : "equipos"}
        </h3>
      </div>
      <div className={styles.scrollableContent}>{renderContent()}</div>
    </div>
  );
};

export default TeamList;

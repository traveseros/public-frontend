import React from "react";
import { TeamData } from "@/types/global";
import styles from "../styles/Popup.module.css";
import {
  getRouteDisplayName,
  getStatusDisplayName,
  getStatusColor,
} from "../app/lib/teams/utils";

interface TeamPopupProps {
  team: TeamData;
  lastPosition: { lat: number; lng: number };
}

const TeamPopup: React.FC<TeamPopupProps> = ({ team, lastPosition }) => {
  return (
    <div className={styles.popupContainer}>
      <h3 className={styles.popupTitle}>Dorsal: {team.dorsal}</h3>
      <div className={styles.popupContent}>
        <p>
          <span className={styles.popupLabel}>Nombre:</span>
          <span className={styles.popupValue}>{team.name}</span>
        </p>
        <p>
          <span className={styles.popupLabel}>Ruta:</span>
          <span className={styles.popupValue}>
            {getRouteDisplayName(team.route)}
          </span>
        </p>
        <p>
          <span className={styles.popupLabel}>Estado:</span>
          <span
            className={`${styles.popupStatus} ${styles.popupValue}`}
            style={{
              backgroundColor: getStatusColor(team.status),
              color:
                team.status === "dangerous" || team.status === "in progress"
                  ? "white"
                  : "black",
            }}
          >
            {getStatusDisplayName(team.status)}
          </span>
        </p>
        <p>
          <span className={styles.popupLabel}>Posición:</span>
          <span className={styles.popupValue}>
            {lastPosition.lat.toFixed(4)}, {lastPosition.lng.toFixed(4)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default TeamPopup;

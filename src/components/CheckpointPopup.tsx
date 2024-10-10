import React from "react";
import { CheckpointData } from "@/types/global";
import styles from "../styles/Popup.module.css";
import { getRouteDisplayName } from "../app/lib/teams/utils";

interface CheckpointPopupProps {
  checkpoint: CheckpointData;
}

const CheckpointPopup: React.FC<CheckpointPopupProps> = ({ checkpoint }) => {
  return (
    <div className={styles.popupContainer}>
      <h3 className={styles.popupTitle}>{checkpoint.name}</h3>
      <div className={styles.popupContent}>
        <p>
          <span className={styles.popupLabel}>Ruta:</span>
          <span className={styles.popupValue}>
            {getRouteDisplayName(checkpoint.type)}
          </span>
        </p>
        <p>
          <span className={styles.popupLabel}>Grupo:</span>
          <span className={styles.popupValue}>{checkpoint.group}</span>
        </p>
        <p>
          <span className={styles.popupLabel}>Coordenadas:</span>
          <span className={styles.popupValue}>
            {checkpoint.coordinates.lat.toFixed(4)},
            {checkpoint.coordinates.lng.toFixed(4)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CheckpointPopup;

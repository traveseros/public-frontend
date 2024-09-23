import React from "react";
import styles from "../styles/LoadingSpinner.module.css";

interface LoadingSpinnerProps {
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = React.memo(
  ({ text = "Cargando mapa..." }) => {
    return (
      <div className={styles.container}>
        <div className={styles.spinner}></div>
        <p className={styles.text}>{text}</p>
      </div>
    );
  }
);

LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;

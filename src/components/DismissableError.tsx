import React, { useState, useEffect } from "react";
import styles from "../styles/DismissableError.module.css";

interface DismissableErrorProps {
  error: {
    message: string;
  };
}

const DismissableError: React.FC<DismissableErrorProps> = ({ error }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible || !error) return null;

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <span className={styles.warningTitle}>Warning:</span>
        <span className={styles.errorMessage}>{error.message}</span>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className={styles.closeButton}
        aria-label="Close"
      >
        &times;
      </button>
    </div>
  );
};

export default DismissableError;

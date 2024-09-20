import React from "react";
import styles from "../styles/VisualError.module.css";

interface ErrorWithMessage {
  message: string;
  stack?: string;
}

type ErrorProps = {
  error: unknown;
};

const VisualError: React.FC<ErrorProps> = ({ error }) => {
  let errorMessage = "";
  let errorStack = "";

  if (typeof error === "string") {
    errorMessage = error;
  } else if (error && typeof error === "object" && "message" in error) {
    const errorObj = error as ErrorWithMessage;
    errorMessage = errorObj.message;
    errorStack = errorObj.stack || "";
  } else if (error instanceof Error) {
    errorMessage = error.message;
    errorStack = error.stack || "";
  } else if (error && typeof error === "object") {
    errorMessage = JSON.stringify(error);
  } else {
    errorMessage = "Ha ocurrido un error desconocido";
  }

  return (
    <div className={styles.errorWrapper}>
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>❌</div>
        <h2 className={styles.errorTitle}>¡Ups! Algo salió mal</h2>
        <p className={styles.errorMessage}>{errorMessage}</p>
        {errorStack && (
          <div className={styles.errorStackContainer}>
            <h3 className={styles.errorStackTitle}>Detalles del error:</h3>
            <pre className={styles.errorStack}>{errorStack}</pre>
          </div>
        )}
        <div className={styles.errorTip}>
          Intenta refrescar la página o contacta con soporte si el problema
          persiste.
        </div>
      </div>
    </div>
  );
};

export default VisualError;

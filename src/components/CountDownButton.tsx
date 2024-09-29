import React, { useState, useEffect, useRef, useCallback } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import styles from "../styles/CountDownButton.module.css";
import Tooltip from "./Tooltip";
import { UseQueryResult } from "@tanstack/react-query";
import { TeamData, ErrorWithMessage } from "@/types/global";

interface CountDownButtonProps {
  initialTime?: number;
  onRefetch: () => Promise<UseQueryResult<TeamData[], ErrorWithMessage>>;
  map?: L.Map;
}

const CountDownButton: React.FC<CountDownButtonProps> = ({
  initialTime = 60,
  onRefetch,
  map: externalMap,
}) => {
  const [countdown, setCountdown] = useState(initialTime);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const internalMap = useMap();
  const map = externalMap || internalMap;

  const callApiAndReset = useCallback(async () => {
    setLoading(true);
    try {
      const result = await onRefetch();
      if (result.isError && result.error) {
        throw result.error;
      }
      console.log("API call completed");
      setCountdown(initialTime);
      setIsActive(true);
    } catch (error) {
      console.error("Error in API call:", error);
    } finally {
      setLoading(false);
    }
  }, [initialTime, onRefetch]);

  useEffect(() => {
    if (containerRef.current && map) {
      const container = containerRef.current;
      const control = L.DomUtil.create("div", "leaflet-control-container");
      container.appendChild(control);

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
    }
  }, [map]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      callApiAndReset();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, countdown, callApiAndReset]);

  const handleClick = () => {
    callApiAndReset();
  };

  const progress = (countdown / initialTime) * 100;

  return (
    <div
      ref={containerRef}
      className={`${styles.countDownButtonContainer} ${
        map ? "leaflet-top leaflet-left" : ""
      }`}
    >
      <div className={map ? "leaflet-control leaflet-bar" : ""}>
        <Tooltip text="Actualizar datos">
          <button
            className={styles.countDownButton}
            onClick={handleClick}
            aria-label="Actualizar datos"
            disabled={loading}
          >
            <svg className={styles.spinner} viewBox="0 0 100 100">
              <circle
                className={styles.spinnerBackground}
                strokeWidth="8"
                r="46"
                cx="50"
                cy="50"
              />
              <circle
                className={styles.spinnerForeground}
                strokeWidth="8"
                strokeDasharray={46 * 2 * Math.PI}
                strokeDashoffset={46 * 2 * Math.PI * (1 - progress / 100)}
                r="46"
                cx="50"
                cy="50"
              />
            </svg>
            <span className={styles.countdownText}>{countdown}</span>
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default CountDownButton;

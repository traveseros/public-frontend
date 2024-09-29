import React, { useEffect, useRef } from "react";
import L from "leaflet";
import styles from "../styles/CenterMapButton.module.css";
import HomeIcon from "./icons/HomeIcon";
import Tooltip from "./Tooltip";

interface CenterMapButtonProps {
  center: [number, number];
  map: L.Map;
}

const CenterMapButton: React.FC<CenterMapButtonProps> = ({ center, map }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && map) {
      const container = containerRef.current;
      const control = L.DomUtil.create("div", "leaflet-control-container");
      container.appendChild(control);

      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);
    }
  }, [map]);

  const handleClick = () => {
    map.setView(center, map.getZoom());
  };

  return (
    <div
      ref={containerRef}
      className={`${styles.centerMapButtonContainer} leaflet-top leaflet-left`}
    >
      <div className="leaflet-control leaflet-bar">
        <Tooltip text="Ir a la base">
          <button
            className={styles.centerMapButton}
            onClick={handleClick}
            aria-label="Ir a la base"
          >
            <HomeIcon
              className={styles.homeIcon}
              width="20"
              height="20"
              strokeWidth="3"
            />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};

export default CenterMapButton;

import React, { useEffect } from "react";
import styles from "../styles/MapFilter.module.css";
import { TeamData } from "../utils/api";
import { getRouteDisplayName, getStatusDisplayName } from "../utils/teamUtils";

interface MapFilterProps {
  routeFilters: TeamData["route"][];
  statusFilters: TeamData["status"][];
  onRouteFiltersChange: (routes: TeamData["route"][]) => void;
  onStatusFiltersChange: (statuses: TeamData["status"][]) => void;
}

const MapFilter: React.FC<MapFilterProps> = ({
  routeFilters,
  statusFilters,
  onRouteFiltersChange,
  onStatusFiltersChange,
}) => {
  const routes: TeamData["route"][] = ["family", "short", "long"];
  const statuses: TeamData["status"][] = [
    "not started",
    "in progress",
    "warning",
    "dangerous",
    "finished",
  ];

  useEffect(() => {
    if (routeFilters.length === 0) {
      onRouteFiltersChange([...routes]);
    }
    if (statusFilters.length === 0) {
      onStatusFiltersChange([...statuses]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRouteChange = (route: TeamData["route"]) => {
    const updatedFilters = routeFilters.includes(route)
      ? routeFilters.filter((r) => r !== route)
      : [...routeFilters, route];
    onRouteFiltersChange(updatedFilters.length > 0 ? updatedFilters : []);
  };

  const handleStatusChange = (status: TeamData["status"]) => {
    const updatedFilters = statusFilters.includes(status)
      ? statusFilters.filter((s) => s !== status)
      : [...statusFilters, status];
    onStatusFiltersChange(updatedFilters.length > 0 ? updatedFilters : []);
  };

  const handleSelectAllRoutes = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onRouteFiltersChange(event.target.checked ? [...routes] : []);
  };

  const handleSelectAllStatuses = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    onStatusFiltersChange(event.target.checked ? [...statuses] : []);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.column}>
          <div className={styles.checkboxGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={routeFilters.length === routes.length}
                onChange={handleSelectAllRoutes}
                className={styles.checkbox}
              />
              <span>Todas las rutas</span>
            </label>
            {routes.map((route) => (
              <label key={route} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={routeFilters.includes(route)}
                  onChange={() => handleRouteChange(route)}
                  className={styles.checkbox}
                />
                <span>{getRouteDisplayName(route)}</span>
              </label>
            ))}
          </div>
        </div>
        <div className={styles.column}>
          <div className={styles.checkboxGrid}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={statusFilters.length === statuses.length}
                onChange={handleSelectAllStatuses}
                className={styles.checkbox}
              />
              <span>Todos los estados</span>
            </label>
            {statuses.map((status) => (
              <label key={status} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={statusFilters.includes(status)}
                  onChange={() => handleStatusChange(status)}
                  className={styles.checkbox}
                />
                <span>{getStatusDisplayName(status)}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MapFilter;

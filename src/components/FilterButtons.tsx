import React, { useEffect } from "react";
import { TeamData } from "../utils/api";
import { getRouteDisplayName, getStatusDisplayName } from "../utils/team";
import styles from "../styles/FilterButtons.module.css";

interface FilterButtonsProps {
  routeFilters: TeamData["route"][];
  statusFilters: TeamData["status"][];
  onRouteFiltersChange: (routes: TeamData["route"][]) => void;
  onStatusFiltersChange: (statuses: TeamData["status"][]) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({
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
  }, []);

  const toggleRouteFilter = (route: TeamData["route"]) => {
    const updatedFilters = routeFilters.includes(route)
      ? routeFilters.filter((f) => f !== route)
      : [...routeFilters, route];
    onRouteFiltersChange(updatedFilters);
  };

  const toggleStatusFilter = (status: TeamData["status"]) => {
    const updatedFilters = statusFilters.includes(status)
      ? statusFilters.filter((f) => f !== status)
      : [...statusFilters, status];
    onStatusFiltersChange(updatedFilters);
  };

  const toggleAllRoutes = () => {
    onRouteFiltersChange(
      routeFilters.length === routes.length ? [] : [...routes]
    );
  };

  const toggleAllStatuses = () => {
    onStatusFiltersChange(
      statusFilters.length === statuses.length ? [] : [...statuses]
    );
  };

  return (
    <div className={styles.filterContainer}>
      <div className={styles.filterGroup}>
        <button
          className={`${styles.filterButton} ${styles.allButton} ${
            routeFilters.length === routes.length ? styles.active : ""
          }`}
          onClick={toggleAllRoutes}
        >
          Todas las rutas
        </button>
        {routes.map((route) => (
          <button
            key={route}
            className={`${styles.filterButton} ${
              routeFilters.includes(route) ? styles.active : ""
            }`}
            onClick={() => toggleRouteFilter(route)}
          >
            {getRouteDisplayName(route)}
          </button>
        ))}
      </div>
      <div className={styles.filterGroup}>
        <button
          className={`${styles.filterButton} ${styles.allButton} ${
            statusFilters.length === statuses.length ? styles.active : ""
          }`}
          onClick={toggleAllStatuses}
        >
          Todos los estados
        </button>
        {statuses.map((status) => (
          <button
            key={status}
            className={`${styles.filterButton} ${
              statusFilters.includes(status) ? styles.active : ""
            }`}
            onClick={() => toggleStatusFilter(status)}
          >
            {getStatusDisplayName(status)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterButtons;

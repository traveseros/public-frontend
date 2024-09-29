import React, { useState, useRef, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import { useTeamData } from "../hooks/useTeamData";
import { RouteType, TeamStatus } from "@/types/global";
import TeamMapElements from "./TeamMapElements";
import TeamList from "./TeamList";
import FilterButtons from "./FilterButtons";
import VisualError from "./VisualError";
import CenterMapButton from "./CenterMapButton";

const ChangeView: React.FC<{ center: [number, number] }> = React.memo(
  ({ center }) => {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
  }
);

ChangeView.displayName = "ChangeView";

const MapEventHandler: React.FC<{ onMapClick: () => void }> = ({
  onMapClick,
}) => {
  useMapEvents({
    click: onMapClick,
  });
  return null;
};

const Map: React.FC = () => {
  const { teams, error } = useTeamData();
  const mapRef = useRef<L.Map | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [routeFilters, setRouteFilters] = useState<RouteType[]>([]);
  const [statusFilters, setStatusFilters] = useState<TeamStatus[]>([]);

  const handleTeamSelect = useCallback((teamId: number | null) => {
    setSelectedTeamId((prevSelectedTeamId) =>
      prevSelectedTeamId === teamId ? null : teamId
    );
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedTeamId(null);
  }, []);

  const filteredTeams = useMemo(() => {
    if (routeFilters.length === 0 || statusFilters.length === 0) {
      return [];
    }
    return teams.filter(
      (team) =>
        routeFilters.includes(team.route) && statusFilters.includes(team.status)
    );
  }, [teams, routeFilters, statusFilters]);

  const initialCenter: [number, number] = [37.429731, -1.523433];
  const initialZoom = 15;

  const selectedTeam = useMemo(() => {
    return teams.find((team) => team.id === selectedTeamId) || null;
  }, [teams, selectedTeamId]);

  const memoizedTeamMapElements = useMemo(() => {
    if (routeFilters.length === 0 || statusFilters.length === 0) {
      return null;
    }
    return filteredTeams.map((team) => (
      <TeamMapElements
        key={team.id}
        team={team}
        isSelected={team.id === selectedTeamId}
        onTeamSelect={handleTeamSelect}
      />
    ));
  }, [
    filteredTeams,
    selectedTeamId,
    handleTeamSelect,
    routeFilters,
    statusFilters,
  ]);

  if (error) return <VisualError error={error} />;

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        scrollWheelZoom={true}
        className={styles.leafletContainer}
        ref={mapRef}
      >
        {selectedTeam && (
          <ChangeView
            center={[
              selectedTeam.routeCoordinates[
                selectedTeam.routeCoordinates.length - 1
              ].lat,
              selectedTeam.routeCoordinates[
                selectedTeam.routeCoordinates.length - 1
              ].lng,
            ]}
          />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {memoizedTeamMapElements}
        <CenterMapButton center={initialCenter} />
        <MapEventHandler onMapClick={handleMapClick} />
      </MapContainer>
      <FilterButtons
        routeFilters={routeFilters}
        statusFilters={statusFilters}
        onRouteFiltersChange={setRouteFilters}
        onStatusFiltersChange={setStatusFilters}
      />
      <div className={styles.teamListWrapper}>
        <TeamList
          teams={filteredTeams}
          selectedTeamId={selectedTeamId}
          onTeamSelect={handleTeamSelect}
          routeFilters={routeFilters}
          statusFilters={statusFilters}
        />
      </div>
    </div>
  );
};

export default React.memo(Map);

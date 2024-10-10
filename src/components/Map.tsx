import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  useMap,
  useMapEvents,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import { useRouteData } from "../hooks/useRouteData";
import { RouteType, TeamStatus, TeamData } from "@/types/global";
import TeamMapElements from "./TeamMapElements";
import RouteMapElements from "./RouteMapElements";
import TeamList from "./TeamList";
import FilterButtons from "./FilterButtons";
import MapControlsWrapper from "./MapControlsWrapper";
import { UseQueryResult } from "@tanstack/react-query";
import { ErrorWithMessage } from "@/types/global";

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

interface MapProps {
  teams: TeamData[];
  refetch: () => Promise<
    UseQueryResult<
      { teams: TeamData[]; error?: ErrorWithMessage },
      ErrorWithMessage
    >
  >;
}

const Map: React.FC<MapProps> = ({ teams, refetch }) => {
  const { routes, loading: routesLoading, error: routesError } = useRouteData();
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

  const initialCenter: [number, number] = [
    Number(process.env.NEXT_PUBLIC_INITIAL_CENTER_LAT),
    Number(process.env.NEXT_PUBLIC_INITIAL_CENTER_LNG),
  ];
  const initialZoom = Number(process.env.NEXT_PUBLIC_INITIAL_ZOOM);

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
        <Circle
          center={initialCenter}
          radius={100}
          pathOptions={{
            color: "red",
            fillColor: "#f03",
            fillOpacity: 0.5,
          }}
        ></Circle>
        {memoizedTeamMapElements}
        {!routesLoading && !routesError && routes && (
          <RouteMapElements routes={routes} />
        )}
        <MapControlsWrapper center={initialCenter} onRefetch={refetch} />
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

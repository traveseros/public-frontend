import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import { useTeamData } from "../hooks/useTeamData";
import { TeamData } from "../app/api/teams/route";
import TeamMapElements from "./TeamMapElements";
import TeamList from "./TeamList";
import FilterButtons from "./FilterButtons";
import LoadingSpinner from "./LoadingSpinner";
import VisualError from "./VisualError";
import CenterMapButton from "./CenterMapButton";

const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
    map.invalidateSize();
  }, [center, map]);
  return null;
};

const Map: React.FC = () => {
  const { teams, loading, error } = useTeamData();
  const mapRef = useRef<L.Map | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const markerRefs = useRef<{ [key: number]: L.Marker }>({});
  const [routeFilters, setRouteFilters] = useState<TeamData["route"][]>([]);
  const [statusFilters, setStatusFilters] = useState<TeamData["status"][]>([]);

  useEffect(() => {
    if (selectedTeam && mapRef.current) {
      const lastPosition =
        selectedTeam.routeCoordinates[selectedTeam.routeCoordinates.length - 1];
      mapRef.current.panTo([lastPosition.lat, lastPosition.lng], {
        animate: true,
      });
    }
  }, [selectedTeam]);

  const handleTeamClick = useCallback(
    (team: TeamData) => {
      Object.values(markerRefs.current).forEach((marker) =>
        marker.closePopup()
      );

      if (selectedTeam && selectedTeam.id === team.id) {
        setSelectedTeam(null);
      } else {
        setSelectedTeam(team);
        const lastPosition =
          team.routeCoordinates[team.routeCoordinates.length - 1];
        mapRef.current?.panTo([lastPosition.lat, lastPosition.lng], {
          animate: true,
        });

        const marker = markerRefs.current[team.id];
        if (marker) {
          marker.openPopup();
        }
      }
    },
    [selectedTeam]
  );

  const filteredTeams = useMemo(() => {
    return teams.filter(
      (team) =>
        routeFilters.length > 0 &&
        routeFilters.includes(team.route) &&
        statusFilters.length > 0 &&
        statusFilters.includes(team.status)
    );
  }, [teams, routeFilters, statusFilters]);

  const shouldRenderTeams = routeFilters.length > 0 && statusFilters.length > 0;

  const initialCenter: [number, number] = [37.429731, -1.523433];
  const initialZoom = 15;

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <VisualError error={error} />;
  }

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
        {shouldRenderTeams &&
          filteredTeams.map((team) => (
            <TeamMapElements
              key={team.id}
              team={team}
              isSelected={selectedTeam?.id === team.id}
              onTeamClick={handleTeamClick}
            />
          ))}
        <CenterMapButton center={initialCenter} />
      </MapContainer>
      <FilterButtons
        routeFilters={routeFilters}
        statusFilters={statusFilters}
        onRouteFiltersChange={setRouteFilters}
        onStatusFiltersChange={setStatusFilters}
      />
      <div className={styles.teamListWrapper}>
        <TeamList
          teams={teams}
          selectedTeam={selectedTeam}
          onTeamClick={handleTeamClick}
          routeFilters={routeFilters}
          statusFilters={statusFilters}
        />
      </div>
    </div>
  );
};

export default Map;

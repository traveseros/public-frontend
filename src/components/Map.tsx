import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import { useTeamData, TeamData } from "../utils/api";
import {
  getRouteColor,
  getRouteDisplayName,
  getStatusColor,
  getStatusDisplayName,
  getDorsalIcon,
} from "../utils/teamUtils";
import TeamList from "./TeamList";
import MapFilter from "./MapFilter";

const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
    map.invalidateSize();
  }, [center, map]);
  return null;
};

const Map: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const teams = useTeamData();
  const mapRef = useRef<L.Map | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const markerRefs = useRef<{ [key: number]: L.Marker }>({});
  const [routeFilters, setRouteFilters] = useState<TeamData["route"][]>([]);
  const [statusFilters, setStatusFilters] = useState<TeamData["status"][]>([]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div>Cargando mapa...</div>;

  const initialCenter: [number, number] = [37.429731, -1.523433];
  const initialZoom = 15;

  const handleTeamClick = (team: TeamData) => {
    Object.values(markerRefs.current).forEach((marker) => marker.closePopup());

    if (selectedTeam && selectedTeam.id === team.id) {
      setSelectedTeam(null);
    } else {
      setSelectedTeam(team);
      const lastPosition =
        team.routeCoordinates[team.routeCoordinates.length - 1];
      mapRef.current?.setView([lastPosition.lat, lastPosition.lng], 10);

      const marker = markerRefs.current[team.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      routeFilters.length > 0 &&
      routeFilters.includes(team.route) &&
      statusFilters.length > 0 &&
      statusFilters.includes(team.status)
  );

  const shouldRenderTeams = routeFilters.length > 0 && statusFilters.length > 0;

  const dorsalIconStyles = {
    customDivIcon: styles.customDivIcon,
    markerPin: styles.markerPin,
    markerContent: styles.markerContent,
  };

  return (
    <div className={styles.mapPageContainer}>
      <MapFilter
        routeFilters={routeFilters}
        statusFilters={statusFilters}
        onRouteFiltersChange={setRouteFilters}
        onStatusFiltersChange={setStatusFilters}
      />
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
              <React.Fragment key={team.id}>
                <Marker
                  position={[
                    team.routeCoordinates[team.routeCoordinates.length - 1].lat,
                    team.routeCoordinates[team.routeCoordinates.length - 1].lng,
                  ]}
                  icon={getDorsalIcon(
                    team,
                    selectedTeam?.id === team.id,
                    dorsalIconStyles
                  )}
                  ref={(ref) => {
                    if (ref) {
                      markerRefs.current[team.id] = ref;
                    }
                  }}
                  eventHandlers={{
                    click: () => handleTeamClick(team),
                  }}
                >
                  <Popup offset={[0, -10]}>
                    <div>
                      Dorsal: <strong>{team.dorsal}</strong> <br />
                      Nombre: {team.name} <br />
                      Ruta: {getRouteDisplayName(team.route)}
                      <br />
                      Estado:{" "}
                      <span
                        style={{
                          backgroundColor: getStatusColor(team.status),
                          color:
                            team.status === "dangerous" ||
                            team.status === "in progress"
                              ? "white"
                              : "black",
                          padding: "2px 5px",
                          borderRadius: "3px",
                        }}
                      >
                        {getStatusDisplayName(team.status)}
                      </span>
                      <br />
                      Lat:{" "}
                      {team.routeCoordinates[
                        team.routeCoordinates.length - 1
                      ].lat.toFixed(4)}
                      , Lon:{" "}
                      {team.routeCoordinates[
                        team.routeCoordinates.length - 1
                      ].lng.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
                <Polyline
                  positions={team.routeCoordinates.map((coord) => [
                    coord.lat,
                    coord.lng,
                  ])}
                  color={getRouteColor(team.route)}
                  weight={3}
                  opacity={0.7}
                />
              </React.Fragment>
            ))}
        </MapContainer>
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
    </div>
  );
};

export default Map;

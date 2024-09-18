import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import { useTeamData, TeamData } from "../utils/api";
import LegendFilter from "./LegendFilter";

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
  const [routeFilter, setRouteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return <div>Cargando mapa...</div>;

  const initialCenter: [number, number] = [37.429731, -1.523433];
  const initialZoom = 5;

  const handleTeamClick = (team: TeamData) => {
    Object.values(markerRefs.current).forEach((marker) => marker.closePopup());

    if (selectedTeam && selectedTeam.id === team.id) {
      setSelectedTeam(null);
    } else {
      setSelectedTeam(team);
      mapRef.current?.setView([team.latitude, team.longitude], 10);

      const marker = markerRefs.current[team.id];
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const getDorsalIcon = (team: TeamData, isSelected: boolean) => {
    const backgroundColor = isSelected ? "red" : getRouteColor(team.route);
    return L.divIcon({
      className: styles.customDivIcon,
      html: `
        <div class="${styles.markerPin}" style="background-color:${backgroundColor};">
          <div class="${styles.markerContent}">
            <span>${team.dorsal}</span>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [-7, 5],
    });
  };

  const getRouteColor = (route: TeamData["route"]): string => {
    switch (route) {
      case "family":
        return "teal";
      case "short":
        return "gold";
      case "long":
        return "violet";
      default:
        return "blue";
    }
  };

  const getRouteDisplayName = (route: TeamData["route"]): string => {
    switch (route) {
      case "family":
        return "Familiar";
      case "short":
        return "Corta";
      case "long":
        return "Larga";
      default:
        return route;
    }
  };

  const getStatusColor = (status: TeamData["status"]): string => {
    switch (status) {
      case "dangerous":
        return "red";
      case "warning":
        return "orange";
      case "in progress":
        return "green";
      default:
        return "inherit";
    }
  };

  const getStatusDisplayName = (status: TeamData["status"]): string => {
    switch (status) {
      case "not started":
        return "No iniciado";
      case "in progress":
        return "En progreso";
      case "warning":
        return "Advertencia";
      case "dangerous":
        return "Peligro";
      case "finished":
        return "Finalizado";
      default:
        return status;
    }
  };

  const filteredTeams = teams.filter(
    (team) =>
      (routeFilter === "all" || team.route === routeFilter) &&
      (statusFilter === "all" || team.status === statusFilter)
  );

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
            center={[selectedTeam.latitude, selectedTeam.longitude]}
          />
        )}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredTeams.map((team) => (
          <Marker
            key={team.id}
            position={[team.latitude, team.longitude]}
            icon={getDorsalIcon(team, selectedTeam?.id === team.id)}
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
                Lat: {team.latitude.toFixed(4)}, Lon:{" "}
                {team.longitude.toFixed(4)}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <LegendFilter
        teams={teams}
        selectedTeam={selectedTeam}
        onTeamClick={handleTeamClick}
        routeFilter={routeFilter}
        statusFilter={statusFilter}
        onRouteFilterChange={setRouteFilter}
        onStatusFilterChange={setStatusFilter}
      />
    </div>
  );
};

export default Map;

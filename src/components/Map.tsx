import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Polyline,
  CircleMarker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import styles from "../styles/Map.module.css";
import { useTeamData } from "../hooks/useTeamData";
import { TeamData } from "../app/api/teams/route";
import {
  getRouteColor,
  getRouteDisplayName,
  getStatusColor,
  getStatusDisplayName,
} from "../app/lib/teams/utils";
import TeamList from "./TeamList";
import FilterButtons from "./FilterButtons";
import LoadingSpinner from "./LoadingSpinner";
import VisualError from "./VisualError";

const ChangeView: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
    map.invalidateSize();
  }, [center, map]);
  return null;
};

const TeamMapElements: React.FC<{
  team: TeamData;
  isSelected: boolean;
  onTeamClick: (team: TeamData) => void;
}> = React.memo(({ team, isSelected, onTeamClick }) => {
  const map = useMap();
  const markerRef = useRef<L.Marker>(null);
  const popupRef = useRef<L.Popup>(null);

  const getTeamColor = useCallback((team: TeamData, isSelected: boolean) => {
    const color = isSelected ? "red" : getRouteColor(team.route);
    return color;
  }, []);

  const teamColor = getTeamColor(team, isSelected);
  const lastPosition = team.routeCoordinates[team.routeCoordinates.length - 1];

  const getDorsalIcon = useCallback(
    (team: TeamData, isSelected: boolean) => {
      const backgroundColor = getTeamColor(team, isSelected);
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
        iconAnchor: [20, 50],
        popupAnchor: [0, -20],
      });
    },
    [getTeamColor]
  );

  useEffect(() => {
    if (isSelected && markerRef.current && popupRef.current) {
      const marker = markerRef.current;
      const popup = popupRef.current;

      marker.bindPopup(popup);

      requestAnimationFrame(() => {
        marker.openPopup();
        map.panTo([lastPosition.lat, lastPosition.lng], {
          animate: true,
          duration: 0.5,
        });
      });
    }
  }, [isSelected, lastPosition.lat, lastPosition.lng, map]);

  return (
    <>
      <Polyline
        key={`polyline-${team.id}-${isSelected}`}
        positions={team.routeCoordinates.map((coord) => [coord.lat, coord.lng])}
        color={teamColor}
        weight={3}
        opacity={0.7}
        eventHandlers={{
          click: () => onTeamClick(team),
        }}
      />
      <CircleMarker
        key={`circle-${team.id}-${isSelected}`}
        center={[lastPosition.lat, lastPosition.lng]}
        radius={3}
        color={teamColor}
        fillColor={teamColor}
        fillOpacity={1}
        weight={2}
        eventHandlers={{
          click: () => onTeamClick(team),
        }}
      />
      <Marker
        key={`marker-${team.id}-${isSelected}`}
        position={[lastPosition.lat, lastPosition.lng]}
        icon={getDorsalIcon(team, isSelected)}
        eventHandlers={{
          click: () => onTeamClick(team),
        }}
        ref={markerRef}
      >
        <Popup ref={popupRef} offset={[1.5, -12]}>
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
                  team.status === "dangerous" || team.status === "in progress"
                    ? "white"
                    : "black",
                padding: "2px 5px",
                borderRadius: "3px",
              }}
            >
              {getStatusDisplayName(team.status)}
            </span>
            <br />
            Lat: {lastPosition.lat.toFixed(4)}, Lon:{" "}
            {lastPosition.lng.toFixed(4)}
          </div>
        </Popup>
      </Marker>
    </>
  );
});

TeamMapElements.displayName = "TeamMapElements";

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

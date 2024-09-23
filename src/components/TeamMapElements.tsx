import React, { useEffect, useRef, useCallback } from "react";
import { useMap, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { TeamData } from "../app/api/teams/route";
import {
  getRouteColor,
  getRouteDisplayName,
  getStatusColor,
  getStatusDisplayName,
} from "../app/lib/teams/utils";
import styles from "../styles/TeamMapsElements.module.css";

interface TeamMapElementsProps {
  team: TeamData;
  isSelected: boolean;
  onTeamClick: (team: TeamData) => void;
}

const TeamMapElements: React.FC<TeamMapElementsProps> = React.memo(
  ({ team, isSelected, onTeamClick }) => {
    const map = useMap();
    const markerRef = useRef<L.Marker>(null);
    const popupRef = useRef<L.Popup>(null);

    const getTeamColor = useCallback((team: TeamData, isSelected: boolean) => {
      return isSelected ? "red" : getRouteColor(team.route);
    }, []);

    const teamColor = getTeamColor(team, isSelected);
    const lastPosition =
      team.routeCoordinates[team.routeCoordinates.length - 1];

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
          positions={team.routeCoordinates.map((coord) => [
            coord.lat,
            coord.lng,
          ])}
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
  }
);

TeamMapElements.displayName = "TeamMapElements";

export default TeamMapElements;

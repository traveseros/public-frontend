import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { useMap, Marker, Popup, Polyline, CircleMarker } from "react-leaflet";
import L from "leaflet";
import { createRoot, Root } from "react-dom/client";
import TeamPopup from "./TeamPopup";
import { TeamData } from "@/types/global";
import { getRouteColor } from "../app/lib/teams/utils";
import styles from "../styles/TeamMapsElements.module.css";

interface TeamMapElementsProps {
  team: TeamData;
  isSelected: boolean;
  onTeamSelect: (teamId: number | null) => void;
}

const TeamMapElements: React.FC<TeamMapElementsProps> = React.memo(
  ({ team, isSelected, onTeamSelect }) => {
    const map = useMap();
    const markerRef = useRef<L.Marker>(null);
    const popupRef = useRef<L.Popup>(null);
    const popupNodeRef = useRef<HTMLDivElement | null>(null);
    const rootRef = useRef<Root | null>(null);

    const getTeamColor = useCallback((team: TeamData, isSelected: boolean) => {
      return isSelected ? "red" : getRouteColor(team.route);
    }, []);

    const teamColor = useMemo(
      () => getTeamColor(team, isSelected),
      [getTeamColor, team, isSelected]
    );
    const lastPosition = useMemo(
      () => team.routeCoordinates[team.routeCoordinates.length - 1],
      [team.routeCoordinates]
    );

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
      const marker = markerRef.current;
      const popup = popupRef.current;
      if (!marker || !popup) return;

      marker.setIcon(getDorsalIcon(team, isSelected));
      marker.setLatLng([lastPosition.lat, lastPosition.lng]);

      if (popupNodeRef.current) {
        if (!rootRef.current) {
          rootRef.current = createRoot(popupNodeRef.current);
        }
        rootRef.current.render(<TeamPopup team={team} />);
      }

      const handlePopupClose = () => {
        onTeamSelect(null);
      };

      popup.on("remove", handlePopupClose);

      if (isSelected) {
        marker.openPopup();
        map.panTo([lastPosition.lat, lastPosition.lng], {
          animate: true,
          duration: 0.5,
        });
      } else {
        marker.closePopup();
      }

      return () => {
        popup.off("remove", handlePopupClose);
      };
    }, [isSelected, getDorsalIcon, team, lastPosition, map, onTeamSelect]);

    const handleElementClick = useCallback(
      (e: L.LeafletMouseEvent) => {
        L.DomEvent.stopPropagation(e);
        onTeamSelect(isSelected ? null : team.id);
      },
      [onTeamSelect, team.id, isSelected]
    );

    const eventHandlers = useMemo(
      () => ({
        click: handleElementClick,
      }),
      [handleElementClick]
    );

    return (
      <>
        <Polyline
          positions={team.routeCoordinates.map((coord) => [
            coord.lat,
            coord.lng,
          ])}
          pathOptions={{ color: teamColor, weight: 3, opacity: 0.7 }}
          eventHandlers={eventHandlers}
        />
        <CircleMarker
          center={[lastPosition.lat, lastPosition.lng]}
          pathOptions={{
            color: teamColor,
            fillColor: teamColor,
            fillOpacity: 1,
            weight: 2,
          }}
          radius={3}
          eventHandlers={eventHandlers}
        />
        <Marker
          position={[lastPosition.lat, lastPosition.lng]}
          icon={getDorsalIcon(team, isSelected)}
          eventHandlers={eventHandlers}
          ref={markerRef}
        >
          <Popup ref={popupRef} offset={[1.5, -12]}>
            <TeamPopup team={team} />
          </Popup>
        </Marker>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.team.id === nextProps.team.id &&
      prevProps.team.status === nextProps.team.status &&
      prevProps.team.routeCoordinates[
        prevProps.team.routeCoordinates.length - 1
      ].lat ===
        nextProps.team.routeCoordinates[
          nextProps.team.routeCoordinates.length - 1
        ].lat &&
      prevProps.team.routeCoordinates[
        prevProps.team.routeCoordinates.length - 1
      ].lng ===
        nextProps.team.routeCoordinates[
          nextProps.team.routeCoordinates.length - 1
        ].lng
    );
  }
);

TeamMapElements.displayName = "TeamMapElements";

export default TeamMapElements;

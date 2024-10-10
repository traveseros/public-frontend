import React, { useMemo } from "react";
import { Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import CheckpointPopup from "./CheckpointPopup";
import { CheckpointData } from "@/types/global";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

interface CheckpointMapElementsProps {
  checkpoints: CheckpointData[];
}

const CheckpointMapElements: React.FC<CheckpointMapElementsProps> = ({
  checkpoints,
}) => {
  const checkpointIcon = new Icon({
    iconUrl: "/images/map-marker-flag-icon.svg",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const memoizedCheckpoints = useMemo(() => checkpoints, [checkpoints]);

  return (
    <MarkerClusterGroup
      chunkedLoading
      spiderfyOnMaxZoom={true}
      showCoverageOnHover={false}
      zoomToBoundsOnClick={true}
      maxClusterRadius={40}
    >
      {memoizedCheckpoints.map((checkpoint) => (
        <Marker
          key={checkpoint.id}
          position={[checkpoint.coordinates.lat, checkpoint.coordinates.lng]}
          icon={checkpointIcon}
        >
          <Popup>
            <CheckpointPopup checkpoint={checkpoint} />
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
};

export default React.memo(CheckpointMapElements);

import React from "react";
import { useMap } from "react-leaflet";
import CenterMapButton from "./CenterMapButton";
import CountDownButton from "./CountDownButton";
import { UseQueryResult } from "@tanstack/react-query";
import { TeamData, ErrorWithMessage } from "@/types/global";

interface MapControlsWrapperProps {
  center: [number, number];
  initialTime?: number;
  onRefetch: () => Promise<UseQueryResult<TeamData[], ErrorWithMessage>>;
}

const MapControlsWrapper: React.FC<MapControlsWrapperProps> = ({
  center,
  initialTime,
  onRefetch,
}) => {
  const map = useMap();

  return (
    <>
      <CenterMapButton center={center} map={map} />
      <CountDownButton
        initialTime={initialTime}
        onRefetch={onRefetch}
        map={map}
      />
    </>
  );
};

export default MapControlsWrapper;

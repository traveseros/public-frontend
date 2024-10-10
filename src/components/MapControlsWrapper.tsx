import React from "react";
import { useMap } from "react-leaflet";
import CenterMapButton from "./CenterMapButton";
import CountDownButton from "./CountDownButton";
import { UseQueryResult } from "@tanstack/react-query";
import { TeamData, ErrorWithMessage } from "@/types/global";

interface MapControlsWrapperProps {
  center: [number, number];
  onRefetch: () => Promise<
    UseQueryResult<
      { teams: TeamData[]; error?: ErrorWithMessage },
      ErrorWithMessage
    >
  >;
}

const MapControlsWrapper: React.FC<MapControlsWrapperProps> = ({
  center,
  onRefetch,
}) => {
  const map = useMap();

  return (
    <>
      <CenterMapButton center={center} map={map} />
      <CountDownButton onRefetch={onRefetch} map={map} />
    </>
  );
};

export default MapControlsWrapper;

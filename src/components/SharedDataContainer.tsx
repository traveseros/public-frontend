"use client";

import React, { useMemo } from "react";
import { useTeamData } from "../hooks/useTeamData";
import dynamic from "next/dynamic";
import LoadingSpinner from "./LoadingSpinner";
import { TeamData, ErrorWithMessage } from "@/types/global";
import VisualError from "./VisualError";
import { UseQueryResult } from "@tanstack/react-query";

const LazyMap = dynamic(() => import("./Map"), {
  ssr: false,
});
const LazyTable = dynamic(() => import("./Table"), {
  ssr: false,
});

type TeamContextType = {
  teams: TeamData[];
  refetch: () => Promise<UseQueryResult<TeamData[], ErrorWithMessage>>;
};

export const TeamContext = React.createContext<TeamContextType>({
  teams: [],
  refetch: async () =>
    ({ isError: false, error: null } as UseQueryResult<
      TeamData[],
      ErrorWithMessage
    >),
});

const roundCoordinate = (coord: number): number => {
  return Number(coord.toFixed(4));
};

const normalizeTeamData = (team: TeamData): TeamData => {
  const lastCoordinate =
    team.routeCoordinates[team.routeCoordinates.length - 1];
  return {
    ...team,
    routeCoordinates: [
      ...team.routeCoordinates.slice(0, -1),
      {
        lat: roundCoordinate(lastCoordinate.lat),
        lng: roundCoordinate(lastCoordinate.lng),
      },
    ],
  };
};

const SharedDataContainer: React.FC<{ showMap?: boolean }> = React.memo(
  ({ showMap = false }) => {
    const { teams, loading, error, refetch } = useTeamData();

    const normalizedTeams = useMemo(
      () => teams.map(normalizeTeamData),
      [teams]
    );

    if (loading) return <LoadingSpinner />;
    if (error) return <VisualError error={error} />;

    return (
      <TeamContext.Provider value={{ teams: normalizedTeams, refetch }}>
        <div style={{ position: "relative" }}>
          {showMap ? <LazyMap /> : <LazyTable />}
        </div>
      </TeamContext.Provider>
    );
  }
);

SharedDataContainer.displayName = "SharedDataContainer";

export default SharedDataContainer;

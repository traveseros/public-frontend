import React, { useMemo } from "react";
import { useTeamData } from "../hooks/useTeamData";
import dynamic from "next/dynamic";
import LoadingSpinner from "./LoadingSpinner";
import { TeamData, ErrorWithMessage } from "@/types/global";
import VisualError from "./VisualError";
import DismissableError from "./DismissableError";
import { UseQueryResult } from "@tanstack/react-query";

const LazyMap = dynamic(() => import("./Map"), {
  ssr: false,
});
const LazyTable = dynamic(() => import("./Table"), {
  ssr: false,
});

type TeamContextType = {
  teams: TeamData[];
  refetch: () => Promise<
    UseQueryResult<
      { teams: TeamData[]; error?: ErrorWithMessage },
      ErrorWithMessage
    >
  >;
};

export const TeamContext = React.createContext<TeamContextType>({
  teams: [],
  refetch: async () =>
    ({ isError: false, error: null } as UseQueryResult<
      { teams: TeamData[]; error?: ErrorWithMessage },
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

interface SharedDataContainerProps {
  showMap?: boolean;
}

const SharedDataContainer: React.FC<SharedDataContainerProps> = React.memo(
  ({ showMap = false }) => {
    const { teams, loading, error, refetch } = useTeamData();

    const normalizedTeams = useMemo(() => {
      return teams.map(normalizeTeamData);
    }, [teams]);

    const contextValue = useMemo(
      () => ({ teams: normalizedTeams, refetch }),
      [normalizedTeams, refetch]
    );

    if (loading) return <LoadingSpinner />;

    if (normalizedTeams.length === 0) {
      return <VisualError error={{ message: "No team data available" }} />;
    }

    return (
      <TeamContext.Provider value={contextValue}>
        <div style={{ position: "relative" }}>
          {error && <DismissableError error={error} />}
          {showMap ? <LazyMap /> : <LazyTable teams={normalizedTeams} />}
        </div>
      </TeamContext.Provider>
    );
  }
);

SharedDataContainer.displayName = "SharedDataContainer";

export default SharedDataContainer;

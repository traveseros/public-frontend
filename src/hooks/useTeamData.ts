import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { TeamData, ErrorWithMessage, Coordinate } from "@/types/global";
import { useState, useCallback, useEffect } from "react";

const fetchTeams = async (
  lastKnownPoints: Record<number, Coordinate>
): Promise<{
  teams: TeamData[];
  error?: ErrorWithMessage;
}> => {
  const queryParams = new URLSearchParams(
    Object.entries(lastKnownPoints).map(([id, coord]) => [
      `lastPoint[${id}]`,
      `${coord.lat},${coord.lng}`,
    ])
  );
  const response = await fetch(`/api/teams?${queryParams}`);
  const data = await response.json();
  if (!response.ok && !data.teams.length) {
    throw new Error(data.error?.message || "Network response was not ok", {
      cause: data.error?.details,
    });
  }
  return data;
};

export function useTeamData(): {
  teams: TeamData[];
  loading: boolean;
  error: ErrorWithMessage | null;
  refetch: () => Promise<
    UseQueryResult<
      { teams: TeamData[]; error?: ErrorWithMessage },
      ErrorWithMessage
    >
  >;
} {
  const [lastKnownPoints, setLastKnownPoints] = useState<
    Record<number, Coordinate>
  >({});

  const updateLastKnownPoints = useCallback((teams: TeamData[]) => {
    const newLastKnownPoints: Record<number, Coordinate> = {};
    teams.forEach((team) => {
      if (team.routeCoordinates.length > 0) {
        const lastPoint =
          team.routeCoordinates[team.routeCoordinates.length - 1];
        newLastKnownPoints[team.id] = {
          lat: Number(lastPoint.lat.toFixed(4)),
          lng: Number(lastPoint.lng.toFixed(4)),
        };
      }
    });
    setLastKnownPoints(newLastKnownPoints);
  }, []);

  const refetchInterval = process.env.NEXT_PUBLIC_REFETCH_INTERVAL
    ? parseInt(process.env.NEXT_PUBLIC_REFETCH_INTERVAL, 10)
    : 60000;

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery<
    { teams: TeamData[]; error?: ErrorWithMessage },
    ErrorWithMessage
  >({
    queryKey: ["teams", lastKnownPoints],
    queryFn: () => fetchTeams(lastKnownPoints),
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: 3,
  });

  useEffect(() => {
    if (data?.teams) {
      updateLastKnownPoints(data.teams);
    }
  }, [data, updateLastKnownPoints]);

  let formattedError: ErrorWithMessage | null = null;
  if (queryError) {
    formattedError = {
      message:
        queryError instanceof Error
          ? queryError.message
          : "An unknown error occurred",
      stack: queryError instanceof Error ? queryError.stack : undefined,
    };
  } else if (data?.error) {
    formattedError = data.error;
  }

  return {
    teams: data?.teams || [],
    loading,
    error: formattedError,
    refetch: () =>
      refetch() as Promise<
        UseQueryResult<
          { teams: TeamData[]; error?: ErrorWithMessage },
          ErrorWithMessage
        >
      >,
  };
}

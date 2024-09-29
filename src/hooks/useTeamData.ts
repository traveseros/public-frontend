import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { TeamData, ErrorWithMessage } from "@/types/global";

const fetchTeams = async (): Promise<TeamData[]> => {
  const response = await fetch("/api/teams");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Network response was not ok", {
      cause: errorData.details,
    });
  }
  return response.json();
};

export function useTeamData(): {
  teams: TeamData[];
  loading: boolean;
  error: ErrorWithMessage | null;
  refetch: () => Promise<UseQueryResult<TeamData[], ErrorWithMessage>>;
} {
  const {
    data: teams = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<TeamData[], ErrorWithMessage>({
    queryKey: ["teams"],
    queryFn: fetchTeams,
    refetchInterval: 6000,
    refetchIntervalInBackground: true,
    retry: 3,
  });

  let formattedError: ErrorWithMessage | null = null;
  if (error) {
    formattedError = {
      message:
        error instanceof Error ? error.message : "An unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  return {
    teams,
    loading,
    error: formattedError,
    refetch,
  };
}

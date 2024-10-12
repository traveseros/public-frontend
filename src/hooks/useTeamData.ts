import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { TeamData, ErrorWithMessage } from "@/types/global";

const fetchTeams = async (): Promise<{
  teams: TeamData[];
  error?: ErrorWithMessage;
}> => {
  const response = await fetch(`/api/teams`);
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
    queryKey: ["teams"],
    queryFn: fetchTeams,
    refetchInterval,
    refetchIntervalInBackground: true,
    retry: 3,
  });

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
    refetch: refetch as () => Promise<
      UseQueryResult<
        { teams: TeamData[]; error?: ErrorWithMessage },
        ErrorWithMessage
      >
    >,
  };
}

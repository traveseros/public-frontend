import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CheckpointData, ErrorWithMessage } from "@/types/global";

const fetchCheckpoints = async (): Promise<CheckpointData[]> => {
  const response = await fetch("/api/checkpoints");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Network response was not ok");
  }
  return response.json();
};

export function useCheckpointData(): {
  checkpoints: CheckpointData[];
  loading: boolean;
  error: ErrorWithMessage | null;
  refetch: () => Promise<UseQueryResult<CheckpointData[], ErrorWithMessage>>;
} {
  const {
    data: checkpoints = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<CheckpointData[], ErrorWithMessage>({
    queryKey: ["checkpoints"],
    queryFn: fetchCheckpoints,
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
    checkpoints,
    loading,
    error: formattedError,
    refetch,
  };
}

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { CheckpointData, ErrorWithMessage } from "@/types/global";

interface CheckpointResponse {
  checkpoints: CheckpointData[];
  error?: ErrorWithMessage;
}

const fetchCheckpoints = async (): Promise<CheckpointResponse> => {
  const response = await fetch("/api/checkpoints");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export function useCheckpointData(): {
  checkpoints: CheckpointData[];
  loading: boolean;
  error: ErrorWithMessage | null;
  isPartialData: boolean;
  refetch: () => Promise<UseQueryResult<CheckpointResponse, ErrorWithMessage>>;
} {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<CheckpointResponse, ErrorWithMessage>({
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
  } else if (data?.error) {
    formattedError = data.error;
  }

  return {
    checkpoints: data?.checkpoints || [],
    loading,
    error: formattedError,
    isPartialData: !!data?.error,
    refetch,
  };
}

import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { RouteData, ErrorWithMessage } from "@/types/global";

interface RouteResponse {
  routes: RouteData[];
  error?: ErrorWithMessage;
}

const fetchRoutes = async (): Promise<RouteResponse> => {
  const response = await fetch("/api/routes");
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

export function useRouteData(): {
  routes: RouteData[];
  loading: boolean;
  error: ErrorWithMessage | null;
  isPartialData: boolean;
  refetch: () => Promise<UseQueryResult<RouteResponse, ErrorWithMessage>>;
} {
  const {
    data,
    isLoading: loading,
    error,
    refetch,
  } = useQuery<RouteResponse, ErrorWithMessage>({
    queryKey: ["routes"],
    queryFn: fetchRoutes,
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
    routes: data?.routes || [],
    loading,
    error: formattedError,
    isPartialData: !!data?.error,
    refetch,
  };
}

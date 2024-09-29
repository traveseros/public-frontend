import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { RouteData, ErrorWithMessage } from "@/types/global";

const fetchRoutes = async (): Promise<RouteData[]> => {
  const response = await fetch("/api/routes");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Network response was not ok");
  }
  return response.json();
};

export function useRouteData(): {
  routes: RouteData[];
  loading: boolean;
  error: ErrorWithMessage | null;
  refetch: () => Promise<UseQueryResult<RouteData[], ErrorWithMessage>>;
} {
  const {
    data: routes = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery<RouteData[], ErrorWithMessage>({
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
  }

  return {
    routes,
    loading,
    error: formattedError,
    refetch,
  };
}

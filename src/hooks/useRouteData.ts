import { useState, useEffect } from "react";
import { RouteData, ErrorWithMessage } from "@/types/global";

export function useRouteData() {
  const [routes, setRoutes] = useState<RouteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorWithMessage | null>(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/routes");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Network response was not ok", {
            cause: errorData.details,
          });
        }
        const data: RouteData[] = await response.json();
        setRoutes(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching route data:", err);
        if (err instanceof Error) {
          setError({
            message: err.message,
            stack:
              err.cause && typeof err.cause === "object"
                ? (err.cause as { stack?: string }).stack
                : err.stack,
          });
        } else {
          setError({ message: "An unknown error occurred" });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  return { routes, loading, error };
}

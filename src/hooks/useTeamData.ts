import { useState, useEffect } from "react";
import { TeamData } from "../app/api/teams/route";

interface ErrorWithMessage {
  message: string;
  stack?: string;
}

export function useTeamData() {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorWithMessage | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/teams");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Network response was not ok", {
            cause: errorData.details,
          });
        }
        const data: TeamData[] = await response.json();
        if (isMounted) {
          setTeams(data);
          setError(null);
        }
      } catch (err) {
        console.error("Error fetching team data:", err);
        if (isMounted) {
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
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    const intervalId = setInterval(fetchData, 60000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return { teams, loading, error };
}

import { useState, useEffect } from "react";

export interface TeamData {
  id: number;
  dorsal: number;
  name: string;
  route: "family" | "long" | "short";
  status: "not started" | "in progress" | "warning" | "dangerous" | "finished";
  latitude: number;
  longitude: number;
}

const initialTeams: TeamData[] = [
  {
    id: 1,
    dorsal: 1001,
    name: "Alejandro Alejandro",
    route: "family",
    status: "not started",
    latitude: 37.429731,
    longitude: -1.523433,
  },
  {
    id: 2,
    dorsal: 102,
    name: "Antonio",
    route: "long",
    status: "in progress",
    latitude: 37.429731,
    longitude: -1.523433,
  },
  {
    id: 3,
    dorsal: 13,
    name: "Carlos",
    route: "short",
    status: "warning",
    latitude: 37.429731,
    longitude: -1.523433,
  },
  {
    id: 4,
    dorsal: 604,
    name: "David",
    route: "family",
    status: "finished",
    latitude: 37.429731,
    longitude: -1.523433,
  },
  {
    id: 5,
    dorsal: 1005,
    name: "Enrique",
    route: "long",
    status: "dangerous",
    latitude: 37.429731,
    longitude: -1.523433,
  },
];

function updateTeamPosition(team: TeamData): TeamData {
  const latChange = (Math.random() - 0.5) * 0.1;
  const lonChange = (Math.random() - 0.5) * 0.1;
  return {
    ...team,
    latitude: Math.max(-90, Math.min(90, team.latitude + latChange)),
    longitude: team.longitude + lonChange,
  };
}

export function useTeamData(): TeamData[] {
  const [teams, setTeams] = useState<TeamData[]>(initialTeams);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTeams((prevTeams) => prevTeams.map(updateTeamPosition));
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return teams;
}

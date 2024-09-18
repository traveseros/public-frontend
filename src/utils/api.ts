import { useState, useEffect } from "react";

export interface Coordinate {
  lat: number;
  lng: number;
}

export interface TeamData {
  id: number;
  dorsal: number;
  name: string;
  route: "family" | "long" | "short";
  status: "not started" | "in progress" | "warning" | "dangerous" | "finished";
  routeCoordinates: Coordinate[];
}

const initialTeams: TeamData[] = [
  {
    id: 1,
    dorsal: 100,
    name: "Alejandro",
    route: "family",
    status: "not started",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.43, lng: -1.524 },
      { lat: 37.431, lng: -1.525 },
    ],
  },
  {
    id: 2,
    dorsal: 102,
    name: "Antonio",
    route: "long",
    status: "in progress",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.4305, lng: -1.5245 },
      { lat: 37.432, lng: -1.526 },
    ],
  },
  {
    id: 3,
    dorsal: 13,
    name: "Nombre Largo",
    route: "short",
    status: "warning",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.4302, lng: -1.5242 },
      { lat: 37.4315, lng: -1.5255 },
    ],
  },
  {
    id: 4,
    dorsal: 604,
    name: "David",
    route: "family",
    status: "finished",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.4299, lng: -1.5239 },
      { lat: 37.4305, lng: -1.5245 },
    ],
  },
  {
    id: 5,
    dorsal: 105,
    name: "Enrique",
    route: "long",
    status: "dangerous",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.431, lng: -1.525 },
      { lat: 37.433, lng: -1.527 },
    ],
  },
];

function updateTeamPosition(team: TeamData): TeamData {
  const lastPosition = team.routeCoordinates[team.routeCoordinates.length - 1];
  const latChange = (Math.random() - 0.5) * 0.1;
  const lonChange = (Math.random() - 0.5) * 0.1;
  const newLat = Math.max(-90, Math.min(90, lastPosition.lat + latChange));
  const newLon = lastPosition.lng + lonChange;

  return {
    ...team,
    routeCoordinates: [...team.routeCoordinates, { lat: newLat, lng: newLon }],
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

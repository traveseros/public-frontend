import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  ROUTE_TYPES,
  TEAM_STATUSES,
  TeamData,
  Coordinate,
  ErrorWithMessage,
} from "@/types/global";

const DATA_FILE = path.join(process.cwd(), "data", "teams.json");
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;
const USE_EXTERNAL_API = process.env.USE_EXTERNAL_API === "true";

async function readTeamsData(): Promise<TeamData[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading teams data:", error);
    return [];
  }
}

async function writeTeamsData(data: TeamData[]): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

function updateTeamPosition(team: TeamData): TeamData {
  const lastPosition = team.routeCoordinates[team.routeCoordinates.length - 1];
  const latChange = (Math.random() - 0.5) * 0.001;
  const lonChange = (Math.random() - 0.5) * 0.001;
  const newLat = Math.max(-90, Math.min(90, lastPosition.lat + latChange));
  const newLon = lastPosition.lng + lonChange;

  return {
    ...team,
    routeCoordinates: [...team.routeCoordinates, { lat: newLat, lng: newLon }],
  };
}

async function getTeamsFromExternalAPI(): Promise<TeamData[]> {
  if (!EXTERNAL_API_URL) {
    throw new Error("External API URL is not defined");
  }
  const response = await fetch(EXTERNAL_API_URL);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

function validateTeamData(team: TeamData): boolean {
  return (
    typeof team.id === "number" &&
    typeof team.dorsal === "number" &&
    typeof team.name === "string" &&
    Object.values(ROUTE_TYPES).includes(team.route) &&
    Object.values(TEAM_STATUSES).includes(team.status) &&
    Array.isArray(team.routeCoordinates) &&
    team.routeCoordinates.every(
      (coord: Coordinate) =>
        typeof coord.lat === "number" &&
        typeof coord.lng === "number" &&
        coord.lat >= -90 &&
        coord.lat <= 90 &&
        coord.lng >= -180 &&
        coord.lng <= 180
    )
  );
}

function processTeams(newTeams: TeamData[], oldTeams: TeamData[]): TeamData[] {
  const processedTeams: TeamData[] = [];
  const seenIds = new Set();

  for (const team of newTeams) {
    if (validateTeamData(team) && !seenIds.has(team.id)) {
      processedTeams.push(team);
      seenIds.add(team.id);
    } else {
      console.warn(`Invalid or duplicate team data: ${JSON.stringify(team)}`);
    }
  }

  if (processedTeams.length === 0) {
    console.warn("No valid new team data. Using old data.");
    return oldTeams;
  }

  for (const oldTeam of oldTeams) {
    if (!seenIds.has(oldTeam.id)) {
      processedTeams.push(oldTeam);
      seenIds.add(oldTeam.id);
    }
  }

  return processedTeams;
}

export async function GET() {
  try {
    const oldTeams: TeamData[] = await readTeamsData();
    let newTeams: TeamData[];

    if (USE_EXTERNAL_API) {
      newTeams = await getTeamsFromExternalAPI();
    } else {
      newTeams = oldTeams.map(updateTeamPosition);
    }

    const processedTeams = processTeams(newTeams, oldTeams);

    await writeTeamsData(processedTeams);

    return NextResponse.json(processedTeams);
  } catch (error) {
    console.error("Error handling GET request:", error);

    let errorMessage = "Internal Server Error";
    let errorDetails: Partial<ErrorWithMessage> = {};

    if (error instanceof Error) {
      errorMessage = error.message;

      if (process.env.NODE_ENV === "development") {
        errorDetails = { stack: error.stack };
      }
    }

    return NextResponse.json(
      { error: errorMessage, details: errorDetails },
      { status: 500 }
    );
  }
}

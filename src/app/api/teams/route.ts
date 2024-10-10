import { NextRequest, NextResponse } from "next/server";
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

function findNewCoordinates(
  routeCoordinates: Coordinate[],
  lastKnownPoint: Coordinate
): Coordinate[] {
  const index = routeCoordinates.findIndex(
    (coord) =>
      coord.lat === lastKnownPoint.lat && coord.lng === lastKnownPoint.lng
  );
  return index !== -1 ? routeCoordinates.slice(index + 1) : routeCoordinates;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lastKnownPoints: Record<number, Coordinate> = {};

  searchParams.forEach((value, key) => {
    if (key.startsWith("lastPoint[")) {
      const id = parseInt(key.slice(10, -1));
      const [lat, lng] = value.split(",").map(Number);
      lastKnownPoints[id] = { lat, lng };
    }
  });

  let apiError: Error | null = null;
  let teams: TeamData[] = [];

  try {
    teams = await readTeamsData();
    if (teams.length === 0) {
      console.warn("No data in local JSON file.");
    }
    const newTeams: TeamData[] = await getTeamsFromExternalAPI();
    teams = processTeams(newTeams, teams);
    await writeTeamsData(teams);

    teams = teams.map((team) => ({
      ...team,
      routeCoordinates: lastKnownPoints[team.id]
        ? findNewCoordinates(team.routeCoordinates, lastKnownPoints[team.id])
        : team.routeCoordinates,
    }));
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    apiError =
      error instanceof Error ? error : new Error("Unknown error occurred");
    if (teams.length === 0) {
      teams = await readTeamsData();
    }
  }

  const response: {
    teams: TeamData[];
    error?: {
      message: string;
      details?: Partial<ErrorWithMessage>;
    };
  } = { teams };

  if (apiError) {
    response.error = {
      message: "Error connecting to external API. Showing cached data.",
      details: { stack: apiError.stack },
    };
  }

  if (teams.length === 0) {
    response.error = {
      message: "No team data available",
      details: {
        stack:
          "Both external API and local JSON file are empty or inaccessible.",
      },
    };
    return NextResponse.json(response, { status: 404 });
  }

  return NextResponse.json(response, { status: apiError ? 206 : 200 });
}

import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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

export async function GET() {
  try {
    let teams: TeamData[];

    if (USE_EXTERNAL_API) {
      teams = await getTeamsFromExternalAPI();
    } else {
      teams = await readTeamsData();
      teams = teams.map(updateTeamPosition);
      await writeTeamsData(teams);
    }

    return NextResponse.json(teams);
  } catch (error) {
    console.error("Error handling GET request:", error);

    let errorMessage = "Internal Server Error";
    let errorDetails = {};

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

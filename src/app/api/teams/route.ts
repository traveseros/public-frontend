import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { TeamData } from "@/types/global";

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

export async function GET() {
  let teams: TeamData[] = [];
  let apiError: Error | null = null;

  try {
    teams = await getTeamsFromExternalAPI();
    await writeTeamsData(teams);
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    apiError =
      error instanceof Error ? error : new Error("Unknown error occurred");
    teams = await readTeamsData();
  }

  const response: {
    teams: TeamData[];
    error?: {
      message: string;
      details?: string;
    };
  } = { teams };

  if (apiError) {
    response.error = {
      message: "Error connecting to external API. Showing cached data.",
      details: apiError.stack,
    };
  }

  if (teams.length === 0) {
    response.error = {
      message: "No team data available",
      details:
        "Both external API and local JSON file are empty or inaccessible.",
    };
    return NextResponse.json(response, { status: 404 });
  }

  return NextResponse.json(response, { status: apiError ? 206 : 200 });
}

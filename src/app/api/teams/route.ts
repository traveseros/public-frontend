import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { TeamData } from "@/types/global";

const DATA_FILE = path.join(process.cwd(), "data", "teams.json");
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;

async function readTeamsData(): Promise<TeamData[]> {
  try {
    console.log("Reading teams data from file");
    const data = await fs.readFile(DATA_FILE, "utf8");
    const parsedData = JSON.parse(data);
    console.log(`Read ${parsedData.length} teams from file`);
    return parsedData;
  } catch (error) {
    console.error("Error reading teams data:", error);
    return [];
  }
}

async function writeTeamsData(data: TeamData[]): Promise<void> {
  try {
    console.log(`Writing ${data.length} teams to file`);
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
    console.log("Teams data written successfully");
  } catch (error) {
    console.error("Error writing teams data:", error);
    throw error;
  }
}

async function getTeamsFromExternalAPI(): Promise<TeamData[]> {
  if (!EXTERNAL_API_URL) {
    throw new Error("External API URL is not defined");
  }
  console.log(`Fetching teams from external API: ${EXTERNAL_API_URL}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(EXTERNAL_API_URL, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("API response is not an array");
    }
    console.log(`Fetched ${data.length} teams from external API`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Request timed out");
      throw new Error("Request to external API timed out");
    }
    console.error("Error in getTeamsFromExternalAPI:", error);
    throw error;
  }
}

export async function GET() {
  console.log("GET request received for teams");
  let teams: TeamData[] = [];
  let apiError: Error | null = null;

  try {
    console.log("Attempting to fetch data from external API");
    teams = await getTeamsFromExternalAPI();
    console.log("Data fetched successfully, writing to file");
    await writeTeamsData(teams);
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    apiError =
      error instanceof Error ? error : new Error("Unknown error occurred");
    console.log("Attempting to read cached data");
    teams = await readTeamsData();
    console.log("Cached data read, team count:", teams.length);
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
    console.error("No team data available");
    response.error = {
      message: "No team data available",
      details:
        "Both external API and local JSON file are empty or inaccessible.",
    };
    return NextResponse.json(response, { status: 404 });
  }

  console.log(
    `Returning ${teams.length} teams. Status: ${apiError ? 206 : 200}`
  );
  return NextResponse.json(response, { status: apiError ? 206 : 200 });
}

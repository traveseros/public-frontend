import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  CheckpointData,
  CheckpointType,
  ROUTE_TYPES,
  ErrorWithMessage,
} from "@/types/global";

const CHECKPOINTS_FILE = path.join(process.cwd(), "data", "checkpoints.json");
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;

async function readCheckpointsData(): Promise<CheckpointData[]> {
  try {
    console.log("Reading checkpoints data from file");
    const data = await fs.readFile(CHECKPOINTS_FILE, "utf8");
    const parsedData = JSON.parse(data);
    console.log(`Read ${parsedData.length} checkpoints from file`);
    return parsedData;
  } catch (error) {
    console.error("Error reading checkpoints data:", error);
    return [];
  }
}

async function writeCheckpointsData(data: CheckpointData[]): Promise<void> {
  try {
    console.log(`Writing ${data.length} checkpoints to file`);
    await fs.writeFile(CHECKPOINTS_FILE, JSON.stringify(data, null, 2));
    console.log("Checkpoints data written successfully");
  } catch (error) {
    console.error("Error writing checkpoints data:", error);
    throw error;
  }
}

function validateCheckpointData(checkpoint: CheckpointData): boolean {
  const isValid =
    Object.values(ROUTE_TYPES).includes(checkpoint.type as CheckpointType) &&
    typeof checkpoint.coordinates === "object" &&
    typeof checkpoint.coordinates.lat === "number" &&
    typeof checkpoint.coordinates.lng === "number" &&
    checkpoint.coordinates.lat >= -90 &&
    checkpoint.coordinates.lat <= 90 &&
    checkpoint.coordinates.lng >= -180 &&
    checkpoint.coordinates.lng <= 180;

  if (!isValid) {
    console.warn(`Invalid checkpoint data: ${JSON.stringify(checkpoint)}`);
  }

  return isValid;
}

async function getCheckpointsFromExternalAPI(): Promise<CheckpointData[]> {
  if (!EXTERNAL_API_URL) {
    throw new Error("External API URL is not defined");
  }
  console.log(`Fetching checkpoints from external API: ${EXTERNAL_API_URL}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${EXTERNAL_API_URL}/checkpoints`, {
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
    console.log(`Fetched ${data.length} checkpoints from external API`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Request timed out");
      throw new Error("Request to external API timed out");
    }
    console.error("Error in getCheckpointsFromExternalAPI:", error);
    throw error;
  }
}

export async function GET() {
  console.log("GET request received for checkpoints");
  let checkpoints: CheckpointData[] = [];
  let apiError: Error | null = null;

  try {
    console.log("Attempting to fetch data from external API");
    checkpoints = await getCheckpointsFromExternalAPI();
    console.log("Data fetched successfully, writing to file");
    await writeCheckpointsData(checkpoints);
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    apiError =
      error instanceof Error ? error : new Error("Unknown error occurred");
    console.log("Attempting to read cached data");
    checkpoints = await readCheckpointsData();
    console.log("Cached data read, checkpoint count:", checkpoints.length);
  }

  const validCheckpoints = checkpoints.filter(validateCheckpointData);
  console.log(`Valid checkpoints: ${validCheckpoints.length}`);

  if (validCheckpoints.length === 0) {
    console.error("No valid checkpoints found");
    const errorResponse: ErrorWithMessage = {
      message: "No valid checkpoints found",
    };
    return NextResponse.json(errorResponse, { status: 404 });
  }

  const response: {
    checkpoints: CheckpointData[];
    error?: {
      message: string;
      details?: string;
    };
  } = { checkpoints: validCheckpoints };

  if (apiError) {
    response.error = {
      message: "Error connecting to external API. Showing cached data.",
      details: apiError.stack,
    };
  }

  console.log(
    `Returning ${validCheckpoints.length} checkpoints. Status: ${
      apiError ? 206 : 200
    }`
  );
  return NextResponse.json(response, { status: apiError ? 206 : 200 });
}

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

async function readCheckpointsData(): Promise<CheckpointData[]> {
  try {
    const data = await fs.readFile(CHECKPOINTS_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading checkpoints data:", error);
    return [];
  }
}

function validateCheckpointData(checkpoint: CheckpointData): boolean {
  return (
    Object.values(ROUTE_TYPES).includes(checkpoint.type as CheckpointType) &&
    typeof checkpoint.coordinates === "object" &&
    typeof checkpoint.coordinates.lat === "number" &&
    typeof checkpoint.coordinates.lng === "number" &&
    checkpoint.coordinates.lat >= -90 &&
    checkpoint.coordinates.lat <= 90 &&
    checkpoint.coordinates.lng >= -180 &&
    checkpoint.coordinates.lng <= 180
  );
}

export async function GET() {
  try {
    const checkpoints = await readCheckpointsData();
    const validCheckpoints = checkpoints.filter(validateCheckpointData);

    if (validCheckpoints.length === 0) {
      throw new Error("No valid checkpoints found");
    }

    return NextResponse.json(validCheckpoints);
  } catch (error) {
    console.error("Error handling GET request for checkpoints:", error);

    const errorResponse: ErrorWithMessage = {
      message: "Internal Server Error",
    };

    if (error instanceof Error) {
      errorResponse.message = error.message;
      errorResponse.stack = error.stack;
    }

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

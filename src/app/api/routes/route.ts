import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import {
  RouteData,
  RouteType,
  ROUTE_TYPES,
  ErrorWithMessage,
} from "@/types/global";

const ROUTES_FILE = path.join(process.cwd(), "data", "routes.json");

async function readRoutesData(): Promise<RouteData[]> {
  try {
    const data = await fs.readFile(ROUTES_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading routes data:", error);
    return [];
  }
}

function validateRouteData(route: RouteData): boolean {
  return (
    Object.values(ROUTE_TYPES).includes(route.type as RouteType) &&
    Array.isArray(route.coordinates) &&
    route.coordinates.every(
      (coord) =>
        typeof coord.lat === "number" &&
        typeof coord.lng === "number" &&
        coord.lat >= -90 &&
        coord.lat <= 90 &&
        coord.lng >= -180 &&
        coord.lng <= 180
    )
  );
}

export async function GET() {
  try {
    const routes = await readRoutesData();
    const validRoutes = routes.filter(validateRouteData);

    if (validRoutes.length === 0) {
      throw new Error("No valid routes found");
    }

    return NextResponse.json(validRoutes);
  } catch (error) {
    console.error("Error handling GET request for routes:", error);

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

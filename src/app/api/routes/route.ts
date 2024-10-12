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
const EXTERNAL_API_URL = process.env.EXTERNAL_API_URL;

async function readRoutesData(): Promise<RouteData[]> {
  try {
    console.log("Reading routes data from file");
    const data = await fs.readFile(ROUTES_FILE, "utf8");
    const parsedData = JSON.parse(data);
    console.log(`Read ${parsedData.length} routes from file`);
    return parsedData;
  } catch (error) {
    console.error("Error reading routes data:", error);
    return [];
  }
}

async function writeRoutesData(data: RouteData[]): Promise<void> {
  try {
    console.log(`Writing ${data.length} routes to file`);
    await fs.writeFile(ROUTES_FILE, JSON.stringify(data, null, 2));
    console.log("Routes data written successfully");
  } catch (error) {
    console.error("Error writing routes data:", error);
    throw error;
  }
}

function validateRouteData(route: RouteData): boolean {
  const isValid =
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
    );

  if (!isValid) {
    console.warn(`Invalid route data: ${JSON.stringify(route)}`);
  }

  return isValid;
}

async function getRoutesFromExternalAPI(): Promise<RouteData[]> {
  if (!EXTERNAL_API_URL) {
    throw new Error("External API URL is not defined");
  }
  console.log(`Fetching routes from external API: ${EXTERNAL_API_URL}`);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${EXTERNAL_API_URL}/routes`, {
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
    console.log(`Fetched ${data.length} routes from external API`);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Request timed out");
      throw new Error("Request to external API timed out");
    }
    console.error("Error in getRoutesFromExternalAPI:", error);
    throw error;
  }
}

export async function GET() {
  console.log("GET request received for routes");
  let routes: RouteData[] = [];
  let apiError: Error | null = null;

  try {
    console.log("Attempting to fetch data from external API");
    routes = await getRoutesFromExternalAPI();
    console.log("Data fetched successfully, writing to file");
    await writeRoutesData(routes);
  } catch (error) {
    console.error("Error fetching data from external API:", error);
    apiError =
      error instanceof Error ? error : new Error("Unknown error occurred");
    console.log("Attempting to read cached data");
    routes = await readRoutesData();
    console.log("Cached data read, route count:", routes.length);
  }

  const validRoutes = routes.filter(validateRouteData);
  console.log(`Valid routes: ${validRoutes.length}`);

  if (validRoutes.length === 0) {
    console.error("No valid routes found");
    const errorResponse: ErrorWithMessage = {
      message: "No valid routes found",
    };
    return NextResponse.json(errorResponse, { status: 404 });
  }

  const response: {
    routes: RouteData[];
    error?: {
      message: string;
      details?: string;
    };
  } = { routes: validRoutes };

  if (apiError) {
    response.error = {
      message: "Error connecting to external API. Showing cached data.",
      details: apiError.stack,
    };
  }

  console.log(
    `Returning ${validRoutes.length} routes. Status: ${apiError ? 206 : 200}`
  );
  return NextResponse.json(response, { status: apiError ? 206 : 200 });
}

import fs from "fs/promises";
import path from "path";
import {
  ROUTE_TYPES,
  RouteType,
  Coordinate,
  RouteData,
} from "../src/types/global";

const baseCoordinate: Coordinate = { lat: 37.429731, lng: -1.523433 };

function generateRandomCoordinate(
  baseLat: number,
  baseLng: number,
  maxDistance: number
): Coordinate {
  const lat = baseLat + (Math.random() - 0.5) * maxDistance * 2;
  const lng = baseLng + (Math.random() - 0.5) * maxDistance * 2;
  return { lat, lng };
}

function generateRoute(
  type: RouteType,
  pointCount: number,
  maxDistance: number
): RouteData {
  const coordinates: Coordinate[] = [baseCoordinate];

  for (let i = 1; i < pointCount; i++) {
    const prevCoord = coordinates[i - 1];
    coordinates.push(
      generateRandomCoordinate(prevCoord.lat, prevCoord.lng, maxDistance)
    );
  }

  return {
    id: Object.values(ROUTE_TYPES).indexOf(type) + 1,
    type: type,
    coordinates: coordinates,
  };
}

function generateRoutes(): RouteData[] {
  return [
    generateRoute(ROUTE_TYPES.FAMILY, 5, 0.005),
    generateRoute(ROUTE_TYPES.SHORT, 10, 0.01),
    generateRoute(ROUTE_TYPES.LONG, 15, 0.02),
  ];
}

async function generateRoutesJson() {
  const DATA_FILE = path.join(process.cwd(), "data", "routes.json");

  try {
    const routes = generateRoutes();

    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

    await fs.writeFile(DATA_FILE, JSON.stringify(routes, null, 2));

    console.log(`Archivo JSON de rutas generado exitosamente en: ${DATA_FILE}`);
  } catch (error) {
    console.error("Error al generar el archivo JSON de rutas:", error);
  }
}

generateRoutesJson();

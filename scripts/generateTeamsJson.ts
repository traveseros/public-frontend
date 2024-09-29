import fs from "fs/promises";
import path from "path";
import { faker } from "@faker-js/faker";
import {
  ROUTE_TYPES,
  TEAM_STATUSES,
  RouteType,
  TeamStatus,
  Coordinate,
  TeamData,
} from "../src/types/global";

function generateRandomTeams(count: number): TeamData[] {
  const teams: TeamData[] = [];
  const usedDorsals = new Set<number>();
  const baseCoordinate: Coordinate = { lat: 37.429731, lng: -1.523433 };

  for (let i = 1; i <= count; i++) {
    let dorsal: number;
    do {
      dorsal = faker.number.int({ min: 1, max: 200 });
    } while (usedDorsals.has(dorsal));
    usedDorsals.add(dorsal);

    const team: TeamData = {
      id: i,
      dorsal: dorsal,
      name: faker.person.firstName(),
      route: faker.helpers.arrayElement(
        Object.values(ROUTE_TYPES)
      ) as RouteType,
      status: faker.helpers.arrayElement(
        Object.values(TEAM_STATUSES)
      ) as TeamStatus,
      routeCoordinates: [baseCoordinate],
    };

    teams.push(team);
  }

  return teams;
}

async function generateTeamsJson() {
  const DATA_FILE = path.join(process.cwd(), "data", "teams.json");

  try {
    const randomTeams = generateRandomTeams(100);

    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

    await fs.writeFile(DATA_FILE, JSON.stringify(randomTeams, null, 2));

    console.log(`Archivo JSON generado exitosamente en: ${DATA_FILE}`);
  } catch (error) {
    console.error("Error al generar el archivo JSON:", error);
  }
}

generateTeamsJson();

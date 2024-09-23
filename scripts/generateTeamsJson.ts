import fs from "fs/promises";
import path from "path";
import { faker } from "@faker-js/faker";

interface Coordinate {
  lat: number;
  lng: number;
}

interface TeamData {
  id: number;
  dorsal: number;
  name: string;
  route: "family" | "long" | "short";
  status: "not started" | "in progress" | "warning" | "dangerous" | "finished";
  routeCoordinates: Coordinate[];
}

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
      route: faker.helpers.arrayElement(["family", "long", "short"]),
      status: faker.helpers.arrayElement([
        "not started",
        "in progress",
        "warning",
        "dangerous",
        "finished",
      ]),
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

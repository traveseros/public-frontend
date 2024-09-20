import fs from "fs/promises";
import path from "path";

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

const initialTeams: TeamData[] = [
  {
    id: 1,
    dorsal: 100,
    name: "Alejandro",
    route: "family",
    status: "not started",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.43, lng: -1.524 },
      { lat: 37.431, lng: -1.525 },
    ],
  },
  {
    id: 2,
    dorsal: 102,
    name: "Antonio",
    route: "long",
    status: "in progress",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.4305, lng: -1.5245 },
      { lat: 37.432, lng: -1.526 },
    ],
  },
  {
    id: 3,
    dorsal: 13,
    name: "Nombre Largo",
    route: "short",
    status: "warning",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.4302, lng: -1.5242 },
      { lat: 37.4315, lng: -1.5255 },
    ],
  },
  {
    id: 4,
    dorsal: 604,
    name: "David",
    route: "family",
    status: "finished",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.4299, lng: -1.5239 },
      { lat: 37.4305, lng: -1.5245 },
    ],
  },
  {
    id: 5,
    dorsal: 105,
    name: "Enrique",
    route: "long",
    status: "dangerous",
    routeCoordinates: [
      { lat: 37.429731, lng: -1.523433 },
      { lat: 37.431, lng: -1.525 },
      { lat: 37.433, lng: -1.527 },
    ],
  },
];

async function generateTeamsJson() {
  const DATA_FILE = path.join(process.cwd(), "data", "teams.json");

  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });

    await fs.writeFile(DATA_FILE, JSON.stringify(initialTeams, null, 2));

    console.log(`Archivo JSON generado exitosamente en: ${DATA_FILE}`);
  } catch (error) {
    console.error("Error al generar el archivo JSON:", error);
  }
}

generateTeamsJson();

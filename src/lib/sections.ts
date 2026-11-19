// Server-side only - loads sections data from filesystem
import fs from "node:fs";
import path from "node:path";
import type { SectionsStructure } from "./sections-types";

let cachedStructure: SectionsStructure | null = null;

export function getSectionsStructure(): SectionsStructure {
  if (cachedStructure) {
    return cachedStructure;
  }

  const filePath = path.join(process.cwd(), "content", "chapters-structure.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  cachedStructure = JSON.parse(fileContents) as SectionsStructure;

  return cachedStructure;
}

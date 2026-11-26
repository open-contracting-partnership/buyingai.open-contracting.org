// Server-side only - loads sections data from filesystem
import fs from "node:fs";
import path from "node:path";
import type { SectionsStructure } from "./sections-types";

export const CONTENT_DIRECTORY = path.join(process.cwd(), "content");

let cachedStructure: SectionsStructure | null = null;

export function getSectionsStructure(): SectionsStructure {
  if (cachedStructure) {
    return cachedStructure;
  }

  const filePath = path.join(CONTENT_DIRECTORY, "chapters-structure.json");
  const fileContents = fs.readFileSync(filePath, "utf8");
  cachedStructure = JSON.parse(fileContents) as SectionsStructure;

  return cachedStructure;
}

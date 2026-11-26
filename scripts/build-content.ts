import fs from "node:fs";
import path from "node:path";
import { CONTENT_DIRECTORY } from "../src/lib/sections";
import type { Section, SectionsStructure } from "../src/lib/sections-types";

// ============================================
// BUILD CHAPTERS STRUCTURE
// ============================================

function buildChaptersStructure() {
  console.log("\n📚 Building chapters structure...");

  // Read the TOC markdown file
  const tocPath = path.join(CONTENT_DIRECTORY, "00-toc.md");
  const tocContent = fs.readFileSync(tocPath, "utf8");

  // Parse the structure
  const lines = tocContent.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let chapterOrder = 0;

  for (const line of lines) {
    // Match main section (e.g., "1. Introduction")
    const sectionMatch = line.match(/^(\d+)\.\s+(.+)$/);
    if (sectionMatch) {
      const sectionNumber = parseInt(sectionMatch[1], 10);
      const sectionTitle = sectionMatch[2].trim();

      currentSection = {
        number: sectionNumber,
        title: sectionTitle,
        chapters: [],
      };
      sections.push(currentSection);
      continue;
    }

    // Match chapter (e.g., "   1. Introduction")
    const chapterMatch = line.match(/^\s+(\d+)\.\s+(.+)$/);
    if (chapterMatch && currentSection) {
      const chapterTitle = chapterMatch[2].trim();

      // Try to find matching markdown file
      const slug = findMatchingSlug(chapterTitle);

      if (slug) {
        // The order is the chapter's position in the TOC, not its filename's number, which is part of its URL.
        chapterOrder += 1;
        currentSection.chapters.push({
          slug,
          title: chapterTitle,
          order: chapterOrder,
        });
      }
    }
  }

  // Helper function to find matching slug
  function findMatchingSlug(title: string): string | null {
    const files = fs.readdirSync(CONTENT_DIRECTORY);

    // Match by title similarity
    const normalizedTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Try to find a file that contains the normalized title
    const titleMatch = files.find((f) => {
      if (!f.endsWith(".md")) return false;
      const fileSlug = f.replace(/\.md$/, "");
      const fileWithoutPrefix = fileSlug.replace(/^\d+-/, ""); // Remove number prefix

      // Check if the file name (without prefix) matches the title
      return (
        fileWithoutPrefix.toLowerCase().includes(normalizedTitle.substring(0, 20)) ||
        normalizedTitle.substring(0, 20).includes(fileWithoutPrefix.toLowerCase())
      );
    });

    if (titleMatch) {
      return titleMatch.replace(/\.md$/, "");
    }

    console.warn(`⚠️  Could not find matching file for: "${title}"`);
    return null;
  }

  // Build the final structure
  const filteredSections = sections.filter((s) => s.chapters.length > 0);
  const totalChapters = filteredSections.reduce((sum, section) => sum + section.chapters.length, 0);

  const structure: SectionsStructure = { sections: filteredSections };

  // Write to file
  const outputPath = path.join(CONTENT_DIRECTORY, "chapters-structure.json");
  fs.writeFileSync(outputPath, JSON.stringify(structure, null, 2), "utf8");

  console.log("✅ Successfully built chapters-structure.json");
  console.log(`   Sections: ${filteredSections.length}`);
  console.log(`   Chapters: ${totalChapters}`);
}

// ============================================
// BUILD GLOSSARY
// ============================================

interface GlossaryTerm {
  Term: string;
  Definition: string;
}

function buildGlossary() {
  console.log("\n📖 Building glossary...");

  // Read the CSV file
  const csvPath = path.join(CONTENT_DIRECTORY, "glossary.csv");
  const csvContent = fs.readFileSync(csvPath, "utf8");

  // Parse CSV
  const lines = csvContent.split("\n");
  const glossary: GlossaryTerm[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV line (handles quoted fields with commas)
    const regex = /(?:,|\n|^)("(?:[^"]|"")*"|[^",\n]*|(?:\n|$))/g;
    const fields: string[] = [];
    for (const match of line.matchAll(regex)) {
      let field = match[1];
      // Remove quotes and unescape double quotes
      if (field.startsWith('"') && field.endsWith('"')) {
        field = field.slice(1, -1).replace(/""/g, '"');
      }
      fields.push(field);
    }

    // CSV format: Source, Term, Definition
    if (fields.length >= 3) {
      const term = fields[1].trim();
      const definition = fields[2].trim();

      if (term && definition) {
        glossary.push({
          Term: term,
          Definition: definition,
        });
      }
    }
  }

  // Sort alphabetically by term
  glossary.sort((a, b) => a.Term.localeCompare(b.Term));

  // Write to JSON file
  const outputPath = path.join(process.cwd(), "src", "app", "data", "glossary.json");
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  fs.writeFileSync(outputPath, JSON.stringify(glossary, null, 2), "utf8");

  console.log("✅ Successfully built glossary.json");
  console.log(`   Terms: ${glossary.length}`);
}

// ============================================
// RUN ALL BUILDS
// ============================================

try {
  buildChaptersStructure();
  buildGlossary();
  console.log("\n🎉 All content built successfully!\n");
} catch (error) {
  console.error("\n❌ Error building content:", error);
  process.exit(1);
}

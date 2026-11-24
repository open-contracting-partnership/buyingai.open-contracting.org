import type React from "react";

// Markdown emphasis, like "*AI basics*", "Ways to _buy AI_" or "**bold**".
const EMPHASIS = /(\*\*|__|\*|_)(.+?)\1/g;

// Markdown text as plain text, without links or emphasis, for metadata and search.
export function plainText(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(EMPHASIS, "$2")
    .replace(/\s+/g, " ")
    .trim();
}

// The title with its emphasis highlighted, like the chapter's heading.
export function ChapterTitle({ title }: { title: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  for (const match of title.matchAll(EMPHASIS)) {
    parts.push(title.substring(lastIndex, match.index));
    parts.push(
      <span key={match.index} className="bg-green-200 px-1 py-0.5 rounded not-italic">
        {match[2]}
      </span>,
    );
    lastIndex = match.index + match[0].length;
  }
  parts.push(title.substring(lastIndex));
  return <>{parts}</>;
}

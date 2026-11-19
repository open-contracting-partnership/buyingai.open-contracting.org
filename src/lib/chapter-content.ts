import { visit } from "unist-util-visit";
import type { Heading, Root } from "mdast";

export type ContentPart =
  | { type: "markdown"; content: string }
  | { type: "image"; url: string; alt: string }
  | { type: "procurement-pathways" };

function collapsibleHtml(wrapperClass: string, title: string, content: string): string {
  const id = `collapsible-${Math.random().toString(36).substr(2, 9)}`;
  return `<div class="${wrapperClass}" data-collapsible="true">
  <div class="collapsible-header" data-target="${id}">
    <svg class="collapsible-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
    </svg>
    <strong>${title.trim()}</strong>
  </div>
  <div class="collapsible-content" id="${id}" style="display: none;">

${content}

  </div>
</div>

`;
}

// Convert "#### **Title {.collapsible}**" headings and "* **Title: {.collapsible}**" bullets to collapsible HTML.
function processCollapsibles(content: string): string {
  // A heading's section ends at the next h1-h4 heading or at two blank lines.
  const h4CollapsibleRegex =
    /^####\s+\*\*(.*?)\s*\{\.collapsible\}\*\*\s*\n\n((?:(?!^#{1,4}\s|\n\n\n)[\s\S])*)/gm;
  // A bullet's section is its 2-space-indented and blank lines.
  const bulletCollapsibleRegex =
    /^\*\s+\*\*(.*?)\s*\{\.collapsible\}\*\*\s*\n((?:(?:  .+|\s*)\n)*(?:  .+)?)/gm;

  return content
    .replace(h4CollapsibleRegex, (_match, title, body) =>
      collapsibleHtml("collapsible-wrapper", title, body.trim())
    )
    .replace(bulletCollapsibleRegex, (_match, title, body) =>
      collapsibleHtml("collapsible-wrapper-bullet", title, body.replace(/^  /gm, "").trim())
    );
}

// Inline reference-style images ("![alt][ref]" with "[ref]: url") and remove the definitions.
function processImageReferences(content: string): string {
  const imageRefs = new Map<string, string>();
  for (const match of content.matchAll(/^\[([^\]]+)\]:\s*(.+)$/gm)) {
    let imageUrl = match[2].trim();
    if (imageUrl.startsWith("<") && imageUrl.endsWith(">")) {
      imageUrl = imageUrl.slice(1, -1);
    }
    if (imageUrl) {
      imageRefs.set(match[1].toLowerCase().trim(), imageUrl);
    }
  }

  let processed = content;
  imageRefs.forEach((imageUrl, refId) => {
    const escapedRefId = refId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    processed = processed
      .replace(new RegExp(`!\\[(.*?)\\]\\[${escapedRefId}\\]`, "gi"), (_match, altText) => `![${altText || ""}](${imageUrl})`)
      .replace(new RegExp(`^\\[${escapedRefId}\\]:\\s*.+$`, "gim"), "");
  });
  return processed;
}

// Split the content at data URI images (which ReactMarkdown mis-parses) and at the [PROCUREMENT_PATHWAYS] marker.
export function processChapterContent(content: string): ContentPart[] {
  const processed = processImageReferences(processCollapsibles(content));
  const parts: ContentPart[] = [];
  let lastIndex = 0;

  for (const match of processed.matchAll(/!\[([^\]]*)\]\((data:[^)]+)\)|\[PROCUREMENT_PATHWAYS\]/g)) {
    if (match.index > lastIndex) {
      parts.push({ type: "markdown", content: processed.substring(lastIndex, match.index) });
    }
    if (match[2]) {
      parts.push({ type: "image", url: match[2], alt: match[1] || "" });
    } else {
      parts.push({ type: "procurement-pathways" });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < processed.length || parts.length === 0) {
    parts.push({ type: "markdown", content: processed.substring(lastIndex) });
  }

  return parts;
}

// Remark plugin to set a heading's ID from a trailing "{#id}".
export function remarkHeadingIds() {
  return (tree: Root) => {
    visit(tree, "heading", (node: Heading) => {
      const newChildren: any[] = [];
      let foundId: string | null = null;

      for (let i = node.children.length - 1; i >= 0; i--) {
        const child = node.children[i];
        if (child.type === "text" && !foundId) {
          const match = child.value.match(/(.+?)\s*\{#([^}]+)\}\s*$/);
          if (match) {
            foundId = match[2];
            const textWithoutId = match[1].trim();
            if (textWithoutId) {
              newChildren.unshift({ ...child, value: textWithoutId });
            }
            continue;
          }
        }
        newChildren.unshift(child);
      }

      if (foundId) {
        node.children = newChildren;
        (node as any).data = (node as any).data || {};
        (node as any).data.hProperties = (node as any).data.hProperties || {};
        (node as any).data.hProperties.id = foundId;
      }
    });
  };
}

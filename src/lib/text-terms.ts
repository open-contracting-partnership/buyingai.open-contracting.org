const SKIPPED_TAGS = new Set(["SCRIPT", "STYLE", "CODE", "PRE", "INPUT", "TEXTAREA"]);

// Call visit on each text node within root, except within skipped tags or elements with any of skippedClasses.
export function forEachTextNode(root: Node, skippedClasses: string[], visit: (node: Text) => void) {
  const skipped = (element: Element | null) =>
    element !== null &&
    (SKIPPED_TAGS.has(element.tagName) || skippedClasses.some((name) => element.classList.contains(name)));

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent && !skipped(node.parentElement)) {
        visit(node as Text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && !skipped(node as Element)) {
      // Copy the children, since visit can replace them.
      for (const child of Array.from(node.childNodes)) {
        walk(child);
      }
    }
  };
  walk(root);
}

export interface TermMatch<T> {
  index: number;
  length: number;
  value: T;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Find the whole-word, case-insensitive matches of the terms in the text, preferring longer terms, in order.
export function findTerms<T>(text: string, terms: { term: string; value: T }[]): TermMatch<T>[] {
  const matches: TermMatch<T>[] = [];
  for (const { term, value } of [...terms].sort((a, b) => b.term.length - a.term.length)) {
    for (const match of text.matchAll(new RegExp(`\\b${escapeRegex(term)}\\b`, "gi"))) {
      const end = match.index + match[0].length;
      if (!matches.some((m) => match.index < m.index + m.length && end > m.index)) {
        matches.push({ index: match.index, length: match[0].length, value });
      }
    }
  }
  return matches.sort((a, b) => a.index - b.index);
}

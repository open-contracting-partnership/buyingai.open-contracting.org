import clsx from "clsx";
import React from "react";
import { nodeText, renderBold } from "@/lib/react-text";

interface CustomTableProps {
  children: React.ReactNode;
}

// The props that this component reads from react-markdown's elements.
interface ElementProps {
  children?: React.ReactNode;
  node?: { tagName?: string };
}

function propsOf(element: React.ReactElement): ElementProps {
  return element.props as ElementProps;
}

const FRAME_CLASS = "!my-6 sm:!my-8 !overflow-x-auto -mx-4 sm:mx-0 !border !border-gray-300";
const FRAME_STYLE = { borderRadius: "8px 36px 0 0" };
const CELL_CLASS = "!pl-3 sm:!pl-6 !pr-2 sm:!pr-4 !py-3 sm:!py-4 !text-xs sm:!text-sm !text-left !align-top !bg-white";
const HEADER_CELL_CLASS =
  "!pl-3 sm:!pl-6 !pr-2 sm:!pr-4 !py-3 sm:!py-4 !bg-[#EDEBED]/50 !text-left !font-semibold !text-xs sm:!text-sm !text-black !align-top !leading-normal";

// The text of a cell element.
function cellText(cell: React.ReactNode): string {
  return React.isValidElement(cell) ? nodeText(propsOf(cell).children) : "";
}

/**
 * CustomTable component handles special table rendering for tables with:
 * - A title/subtitle in the thead
 * - Column headers in the first tbody row (marked with <strong>)
 * - Data rows in remaining tbody rows
 *
 * Renders with:
 * - Green rounded header section with title and subtitle (with markdown support)
 * - Gray column header row
 * - White data rows
 */
const BULLET_LIST_CLASS = "!list-disc !pl-5 !space-y-1.5 !my-0 !leading-relaxed";
const BULLET_CLASS = "!leading-relaxed !text-xs sm:!text-sm";

export function CustomTable({ children }: CustomTableProps) {
  // Check if this is a table with title in thead and actual headers in first tbody row
  let theadElement: React.ReactElement | null = null;
  let tbodyElement: React.ReactElement | null = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const props = propsOf(child);

      // Check multiple ways to identify thead/tbody
      // ReactMarkdown may use custom components with 'node' prop
      const isTheadByType = child.type === "thead";
      const isTheadByNode = props?.node?.tagName === "thead";
      const isTbodyByType = child.type === "tbody";
      const isTbodyByNode = props?.node?.tagName === "tbody";

      if (isTheadByType || isTheadByNode) {
        theadElement = child as React.ReactElement;
      } else if (isTbodyByType || isTbodyByNode) {
        tbodyElement = child as React.ReactElement;
      } else if (theadElement && !tbodyElement) {
        // If we already found thead and this is not thead, assume it's tbody
        // This handles cases where ReactMarkdown doesn't set node prop for tbody
        tbodyElement = child as React.ReactElement;
      }
    }
  });

  // Only apply custom rendering if we have both thead and tbody
  if (!theadElement || !tbodyElement) {
    return null;
  }

  const theadProps = (theadElement as React.ReactElement).props as {
    children?: React.ReactNode;
  };
  const tbodyProps = (tbodyElement as React.ReactElement).props as {
    children?: React.ReactNode;
  };
  const tbodyRows = React.Children.toArray(tbodyProps.children);

  // Check if first tbody row has <strong> tags (indicating it's actually headers)
  if (tbodyRows.length === 0 || !React.isValidElement(tbodyRows[0])) {
    return null;
  }

  const firstRow = tbodyRows[0];
  const firstRowProps = firstRow.props as { children?: React.ReactNode };
  const firstRowCells = React.Children.toArray(firstRowProps.children);

  // The text of the first strong element in the node.
  const extractStrongText = (node: React.ReactNode): string => {
    if (!node) return "";
    if (typeof node === "string") return "";
    if (React.isValidElement(node)) {
      if (node.type === "strong") {
        const strongProps = node.props as { children?: React.ReactNode };
        return String(strongProps.children || "");
      }
      const nodeProps = node.props as { children?: React.ReactNode };
      if (nodeProps?.children) {
        const children = React.Children.toArray(nodeProps.children);
        for (const child of children) {
          const text = extractStrongText(child);
          if (text) return text;
        }
      }
    }
    if (Array.isArray(node)) {
      for (const item of node) {
        const text = extractStrongText(item);
        if (text) return text;
      }
    }
    return "";
  };

  // The first body row's bold text, which are column headers in some tables.
  const headerCells = firstRowCells.map((cell) => extractStrongText(cell));
  const hasStrongInFirstRow = headerCells.some(Boolean);

  // Helper function to parse and render markdown-like text in header
  const parseHeaderMarkdown = (text: string): React.ReactNode => {
    if (!text) return null;

    const elements: React.ReactNode[] = [];

    // Extract title if it exists (text before first ** or \*\*)
    const titleMatch = text.match(/^([^*\\]+?)(?=(?:\*\*|\\\*\\\*))/);
    let processableText = text;

    if (titleMatch?.[1].trim()) {
      const titleText = titleMatch[1].trim().replace(/:\s*$/, ""); // Remove trailing colon
      elements.push(
        <h3 key="title" className="!text-2xl !font-bold !text-black !mb-3 !font-gteesti-display">
          {titleText}
        </h3>,
      );
      processableText = text.substring(titleMatch[0].length);
    }

    // Now split by section headers (text between ** or \*\*)
    // Pattern: **SectionName** content or \*\*SectionName\*\* content
    const sections: Array<{ title: string; content: string }> = [];

    // Match all **text** or \*\*text\*\* patterns
    const sectionRegex = /(?:\*\*|\\\*\\\*)([^*]+?)(?:\*\*|\\\*\\\*)/g;
    for (const sectionMatch of processableText.matchAll(sectionRegex)) {
      const sectionTitle = sectionMatch[1].trim();
      const startOfContent = sectionMatch.index + sectionMatch[0].length;

      // Find where this section's content ends (at the next ** or end of string)
      let endOfContent = processableText.length;
      const nextSectionMatch = /(?:\*\*|\\\*\\\*)/.exec(processableText.substring(startOfContent));
      if (nextSectionMatch) {
        endOfContent = startOfContent + nextSectionMatch.index;
      }

      const content = processableText.substring(startOfContent, endOfContent).trim();
      sections.push({ title: sectionTitle, content });
    }

    // Process each section
    sections.forEach((section, idx) => {
      // Add section title
      elements.push(
        <p key={`section-${idx}`} className="!text-base !font-bold !text-black !mt-3 !mb-1">
          {section.title}
        </p>,
      );

      // Extract bullets from content
      if (section.content) {
        // Split by - or \- (bullets)
        const bulletParts = section.content.split(/\s*(?:\\-|-)\s+/).filter((part) => part.trim().length > 0);

        if (bulletParts.length > 0) {
          elements.push(
            <ul key={`ul-${idx}`} className="table-header-bullets !list-disc !pl-0 !my-2 !space-y-1">
              {bulletParts.map((bullet, bulletIdx) => (
                <li key={bulletIdx} className="!text-base !text-black !leading-relaxed">
                  {bullet.trim()}
                </li>
              ))}
            </ul>,
          );
        }
      }
    });

    // Fallback: if no sections were found, try line-by-line processing
    if (elements.length === 0 || (titleMatch && elements.length === 1)) {
      const lines = text.split("\n").filter((line) => line.trim());
      let currentBullets: string[] = [];

      const flushBullets = () => {
        if (currentBullets.length > 0) {
          elements.push(
            <ul key={`ul-${elements.length}`} className="table-header-bullets !list-disc !pl-5 !my-2 !space-y-1">
              {currentBullets.map((bullet, idx) => (
                <li key={idx} className="!text-base !text-black !leading-relaxed">
                  {bullet}
                </li>
              ))}
            </ul>,
          );
          currentBullets = [];
        }
      };

      lines.forEach((line, lineIdx) => {
        line = line.trim();

        // Skip if this was already processed as title
        if (titleMatch && lineIdx === 0 && line.startsWith(titleMatch[1].trim())) {
          return;
        }

        // Check for bold sections
        const boldMatch = line.match(/^(?:\\\*\\\*|\*\*)([^*]+)(?:\\\*\\\*|\*\*)$/);
        if (boldMatch) {
          flushBullets();
          const boldText = boldMatch[1].trim();
          elements.push(
            <p key={`section-line-${lineIdx}`} className="!text-base !font-bold !text-black !mt-3 !mb-1">
              {boldText}
            </p>,
          );
          return;
        }

        // Check for bullets
        const bulletMatch = line.match(/^(?:\\-|-)\s+(.+)$/);
        if (bulletMatch) {
          currentBullets.push(bulletMatch[1].trim());
          return;
        }

        // Regular text
        if (line.length > 0) {
          flushBullets();
          elements.push(
            <p key={`text-${lineIdx}`} className="!text-base !text-black !leading-relaxed !my-1">
              {line}
            </p>,
          );
        }
      });

      flushBullets();
    }

    return elements.length > 0 ? elements : <p className="!text-base !text-black">{text}</p>;
  };

  // Process cell content to handle bullet points and markdown (same logic as parseHeaderMarkdown)
  const processContent = (content: React.ReactNode): React.ReactNode => {
    // If content is a complex React element (not p or text), return as is
    if (React.isValidElement(content) && content.type !== "p" && content.type !== "strong") {
      return content;
    }

    // Extract ALL content including text from strong tags
    const extractAllText = (node: React.ReactNode): string => {
      if (!node) return "";

      if (typeof node === "string") {
        return node;
      }

      if (React.isValidElement(node)) {
        // If it's a strong tag, include marker for later
        if (node.type === "strong") {
          const strongProps = propsOf(node);
          const innerText = extractAllText(strongProps.children);
          return `**${innerText}**`; // Mark it with ** so we can detect it
        }

        const nodeProps = propsOf(node);
        return extractAllText(nodeProps.children);
      }

      if (Array.isArray(node)) {
        return node.map(extractAllText).join("");
      }

      return "";
    };

    let textContent = extractAllText(content);

    // If no text content, return original
    if (!textContent || textContent.trim() === "") {
      return content;
    }

    // Clean up escaped markdown first
    textContent = textContent.replace(/\\\*\\\*/g, "**");
    textContent = textContent.replace(/\\-/g, "-");

    // Helper function to split text into bullets (handles " - " and " -" patterns)
    const splitIntoBullets = (text: string): string[] => {
      const trimmedText = text.trim();
      if (!trimmedText) return [];

      // Normalize: replace " - " and " -" with a consistent separator
      // First, handle bullets that start at the beginning
      let normalized = trimmedText;
      if (normalized.startsWith("- ")) {
        normalized = normalized.substring(2); // Remove leading "- "
      } else if (normalized.startsWith("-")) {
        normalized = normalized.substring(1); // Remove leading "-"
      }

      // Split by " - " or " -" patterns
      const parts = normalized
        .split(/\s+-\s+|\s+-/)
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      return parts.length > 0 ? parts : [trimmedText];
    };

    // Check if content has bullets (- or \-) or bold markers (** or \*\*)
    const hasBullets = /(^|\s)-/.test(textContent);
    const hasBold = textContent.includes("**");

    // Check for section pattern: **Section** followed by bullets
    const hasSectionPattern = /\*\*([^*]+?)\*\*\s*-\s*/.test(textContent);

    // If no section pattern but has bullets, process as simple bullet list
    if (!hasSectionPattern && hasBullets) {
      const bullets = splitIntoBullets(textContent);
      if (bullets.length > 1) {
        // Process each bullet for inline bold
        const bulletElements = bullets.map((bullet, idx) => {
          const trimmedBullet = bullet.trim();
          return (
            <li key={`bullet-${idx}`} className={BULLET_CLASS}>
              {renderBold(trimmedBullet)}
            </li>
          );
        });

        return <ul className={BULLET_LIST_CLASS}>{bulletElements}</ul>;
      }
    }

    // If no section pattern detected, just return content with simple bold processing
    if (!hasSectionPattern) {
      // Check if it's just simple bold text without bullets
      if (hasBold && !hasBullets) {
        return <>{renderBold(textContent)}</>;
      }

      // Return original content if no special processing needed
      return content;
    }

    // Parse with section pattern
    const elements: React.ReactNode[] = [];

    // First, split by pattern: **SectionHeader** followed by content
    // This regex finds: **text** - content - more content
    // Updated to handle optional space after hyphen
    const sectionPattern = /\*\*([^*]+?)\*\*\s*-\s*/g;
    let lastIndex = 0;
    for (const match of textContent.matchAll(sectionPattern)) {
      // Add any text before this section
      if (match.index > lastIndex) {
        const beforeText = textContent.substring(lastIndex, match.index).trim();
        if (beforeText) {
          // Process as regular bullets if it contains -
          const beforeBullets = splitIntoBullets(beforeText);
          if (beforeBullets.length > 1) {
            beforeBullets.forEach((bullet, idx) => {
              elements.push(
                <li key={`bullet-before-${lastIndex}-${idx}`} className={BULLET_CLASS}>
                  {bullet}
                </li>,
              );
            });
          } else if (beforeText) {
            elements.push(
              <li key={`bullet-before-${lastIndex}`} className={BULLET_CLASS}>
                {beforeText}
              </li>,
            );
          }
        }
      }

      // Add the section header
      const sectionTitle = match[1].trim();
      elements.push(
        <p
          key={`header-${match.index}`}
          className="!font-semibold !mt-3 !mb-1.5 !text-black !text-xs sm:!text-sm !leading-normal"
        >
          {sectionTitle}
        </p>,
      );

      lastIndex = match.index + match[0].length;
    }

    // Process remaining content after last section
    if (lastIndex < textContent.length) {
      const remainingText = textContent.substring(lastIndex).trim();
      if (remainingText) {
        // Split by bullets using the helper function
        const bullets = splitIntoBullets(remainingText);
        bullets.forEach((bullet, idx) => {
          const trimmedBullet = bullet.trim();

          // Check for inline bold
          elements.push(
            <li key={`bullet-remaining-${idx}`} className={BULLET_CLASS}>
              {renderBold(trimmedBullet)}
            </li>,
          );
        });
      }
    }

    // If we found sections and bullets, wrap in ul
    if (elements.length > 0) {
      // Group consecutive li elements into ul elements
      const grouped: React.ReactNode[] = [];
      let currentBullets: React.ReactElement[] = [];

      elements.forEach((element) => {
        if (React.isValidElement(element) && element.type === "li") {
          currentBullets.push(element);
        } else {
          // Flush current bullets
          if (currentBullets.length > 0) {
            grouped.push(
              <ul key={`ul-${grouped.length}`} className={BULLET_LIST_CLASS}>
                {currentBullets}
              </ul>,
            );
            currentBullets = [];
          }
          grouped.push(element);
        }
      });

      // Flush remaining bullets
      if (currentBullets.length > 0) {
        grouped.push(
          <ul key={`ul-${grouped.length}`} className="!list-disc !pl-5 !space-y-2">
            {currentBullets}
          </ul>,
        );
      }

      return <>{grouped}</>;
    }

    return content;
  };

  // Style the body rows, with borders around every cell, or between rows and columns only.
  const renderRows = (rows: React.ReactNode[], grid: boolean) =>
    rows.map((row, rowIdx) => {
      if (!React.isValidElement(row)) return row;
      const cells = React.Children.toArray(propsOf(row).children);
      return (
        <tr
          key={rowIdx}
          className={grid ? "!border !border-[#6CBA8C]" : "!border-b !border-[#6CBA8C] last:!border-b-0"}
        >
          {cells.map((cell, cellIdx) => {
            if (!React.isValidElement(cell)) return cell;
            const divider = grid
              ? "!border !border-[#6CBA8C]"
              : cellIdx === cells.length - 1
                ? ""
                : "!border-r !border-[#6CBA8C]";
            return (
              <td key={cellIdx} className={clsx(CELL_CLASS, divider, "!leading-relaxed")}>
                {processContent(propsOf(cell).children)}
              </td>
            );
          })}
        </tr>
      );
    });

  // A table with column headers in its thead.
  const renderRegularTable = (headerCells: React.ReactNode[], bodyRows: React.ReactNode[]) => {
    const headers = headerCells.map(cellText);
    return (
      <div className={FRAME_CLASS} style={FRAME_STYLE}>
        <table className="!w-full !min-w-full !my-0" style={{ borderCollapse: "collapse", borderSpacing: 0 }}>
          <thead className="!bg-[#EDEBED]/50">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className={clsx(
                    HEADER_CELL_CLASS,
                    "!border-b !border-gray-300",
                    idx < headers.length - 1 && "!border-r !border-gray-300",
                  )}
                >
                  {header || `Header ${idx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="!bg-white">{renderRows(bodyRows, true)}</tbody>
        </table>
      </div>
    );
  };

  // A table with a green title bar, from the first cell of its thead.
  const renderTitledTable = (title: string, titleClassName: string, table: React.ReactNode) => (
    <div className={FRAME_CLASS} style={FRAME_STYLE}>
      <div className={titleClassName} style={FRAME_STYLE}>
        {parseHeaderMarkdown(title)}
      </div>
      {table}
    </div>
  );

  const theadRow = React.Children.toArray(theadProps.children)[0];
  const theadCells = React.isValidElement(theadRow) ? React.Children.toArray(propsOf(theadRow).children) : [];
  const title = cellText(theadCells[0]);

  // Two or more headers in the thead: a regular table.
  if (theadCells.filter((cell) => cellText(cell).trim()).length >= 2) {
    return renderRegularTable(theadCells, tbodyRows);
  }

  // Only a title in the thead, and no headers in the first body row: a title, and data rows.
  if (title.trim() && !hasStrongInFirstRow && tbodyRows.length > 0) {
    return renderTitledTable(
      title,
      "!bg-[#92C36F] !px-4 sm:!px-8 !py-4 sm:!py-6",
      <table className="!w-full !min-w-full !border-collapse !my-0" style={{ borderSpacing: 0 }}>
        <tbody className="!bg-white">{renderRows(tbodyRows, false)}</tbody>
      </table>,
    );
  }

  // If no strong tags in first row, this is not our special table format
  if (!hasStrongInFirstRow) {
    return null;
  }

  // A title, column headers from the first body row, and data rows.
  return renderTitledTable(
    title,
    "!bg-[#92C36F] !px-4 sm:!px-6 !py-3 sm:!py-5",
    <table className="!my-0 !w-full !min-w-full" style={{ borderCollapse: "collapse", borderSpacing: 0 }}>
      <thead className="!bg-[#EDEBED]">
        <tr>
          {headerCells.map((header, idx) => (
            <th key={idx} className={clsx(HEADER_CELL_CLASS, "!border !border-gray-300 !border-b-0")}>
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="!bg-white">{renderRows(tbodyRows.slice(1), true)}</tbody>
    </table>,
  );
}

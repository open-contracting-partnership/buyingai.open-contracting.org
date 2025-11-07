import React from "react";

interface CustomTableProps {
  children: React.ReactNode;
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
export function CustomTable({ children }: CustomTableProps) {
  // Check if this is a table with title in thead and actual headers in first tbody row
  let theadElement: React.ReactElement | null = null;
  let tbodyElement: React.ReactElement | null = null;

  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child)) {
      const props = child.props as any;

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

  // Helper function to recursively check for strong tags
  const hasStrong = (node: React.ReactNode): boolean => {
    if (!node) return false;
    if (React.isValidElement(node)) {
      if (node.type === "strong") return true;
      const nodeProps = node.props as { children?: React.ReactNode };
      if (nodeProps?.children) {
        return React.Children.toArray(nodeProps.children).some(hasStrong);
      }
    }
    if (Array.isArray(node)) {
      return node.some(hasStrong);
    }
    return false;
  };

  // Check each cell in first row
  let hasStrongInFirstRow = false;
  firstRowCells.forEach((cell) => {
    if (hasStrong(cell)) {
      hasStrongInFirstRow = true;
    }
  });

  // Helper function to extract raw text from React nodes
  const extractRawText = (node: React.ReactNode): string => {
    if (!node) return "";

    if (typeof node === "string") {
      return node;
    }

    if (React.isValidElement(node)) {
      const nodeProps = node.props as { children?: React.ReactNode };
      if (nodeProps?.children) {
        return extractRawText(nodeProps.children);
      }
    }

    if (Array.isArray(node)) {
      return node.map((item) => extractRawText(item)).join("");
    }

    return "";
  };

  // Helper function to parse and render markdown-like text in header
  const parseHeaderMarkdown = (text: string): React.ReactNode => {
    if (!text) return null;

    // Replace <br> tags with actual line breaks
    text = text.replace(/<br\s*\/?>/gi, "\n");

    const elements: React.ReactNode[] = [];

    // Extract title if it exists (text before first ** or \*\*)
    const titleMatch = text.match(/^([^*\\]+?)(?=(?:\*\*|\\\*\\\*))/);
    let processableText = text;

    if (titleMatch && titleMatch[1].trim()) {
      const titleText = titleMatch[1].trim().replace(/:\s*$/, ""); // Remove trailing colon
      elements.push(
        <h3
          key="title"
          className="!text-2xl !font-bold !text-black !mb-3 !font-gteesti-display"
        >
          {titleText}
        </h3>
      );
      processableText = text.substring(titleMatch[0].length);
    }

    // Now split by section headers (text between ** or \*\*)
    // Pattern: **SectionName** content or \*\*SectionName\*\* content
    const sections: Array<{ title: string; content: string }> = [];

    // Match all **text** or \*\*text\*\* patterns
    const sectionRegex = /(?:\*\*|\\\*\\\*)([^*]+?)(?:\*\*|\\\*\\\*)/g;
    let lastIndex = 0;
    let sectionMatch;

    while ((sectionMatch = sectionRegex.exec(processableText)) !== null) {
      const sectionTitle = sectionMatch[1].trim();
      const startOfContent = sectionMatch.index + sectionMatch[0].length;

      // Find where this section's content ends (at the next ** or end of string)
      let endOfContent = processableText.length;
      const nextSectionMatch = /(?:\*\*|\\\*\\\*)/.exec(
        processableText.substring(startOfContent)
      );
      if (nextSectionMatch) {
        endOfContent = startOfContent + nextSectionMatch.index;
      }

      const content = processableText
        .substring(startOfContent, endOfContent)
        .trim();
      sections.push({ title: sectionTitle, content });

      lastIndex = endOfContent;
    }

    // Process each section
    sections.forEach((section, idx) => {
      // Add section title
      elements.push(
        <p
          key={`section-${idx}`}
          className="!text-base !font-bold !text-black !mt-3 !mb-1"
        >
          {section.title}
        </p>
      );

      // Extract bullets from content
      if (section.content) {
        // Split by - or \- (bullets)
        const bulletParts = section.content
          .split(/\s*(?:\\-|-)\s+/)
          .filter((part) => part.trim().length > 0);

        if (bulletParts.length > 0) {
          elements.push(
            <ul
              key={`ul-${idx}`}
              className="table-header-bullets !list-disc !pl-5 !my-2 !space-y-1"
            >
              {bulletParts.map((bullet, bulletIdx) => (
                <li
                  key={bulletIdx}
                  className="!text-base !text-black !leading-relaxed"
                >
                  {bullet.trim()}
                </li>
              ))}
            </ul>
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
            <ul
              key={`ul-${elements.length}`}
              className="table-header-bullets !list-disc !pl-5 !my-2 !space-y-1"
            >
              {currentBullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className="!text-base !text-black !leading-relaxed"
                >
                  {bullet}
                </li>
              ))}
            </ul>
          );
          currentBullets = [];
        }
      };

      lines.forEach((line, lineIdx) => {
        line = line.trim();

        // Skip if this was already processed as title
        if (
          titleMatch &&
          lineIdx === 0 &&
          line.startsWith(titleMatch[1].trim())
        ) {
          return;
        }

        // Check for bold sections
        const boldMatch = line.match(
          /^(?:\\\*\\\*|\*\*)([^*]+)(?:\\\*\\\*|\*\*)$/
        );
        if (boldMatch) {
          flushBullets();
          const boldText = boldMatch[1].trim();
          elements.push(
            <p
              key={`section-line-${lineIdx}`}
              className="!text-base !font-bold !text-black !mt-3 !mb-1"
            >
              {boldText}
            </p>
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
            <p
              key={`text-${lineIdx}`}
              className="!text-base !text-black !leading-relaxed !my-1"
            >
              {line}
            </p>
          );
        }
      });

      flushBullets();
    }

    return elements.length > 0 ? (
      <>{elements}</>
    ) : (
      <p className="!text-base !text-black">{text}</p>
    );
  };

  // Process cell content to handle bullet points and markdown (same logic as parseHeaderMarkdown)
  const processContent = (content: React.ReactNode): React.ReactNode => {
    // If content is a complex React element (not p or text), return as is
    if (
      React.isValidElement(content) &&
      content.type !== "p" &&
      content.type !== "strong"
    ) {
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
          const strongProps = node.props as { children?: any };
          const innerText = extractAllText(strongProps.children);
          return `**${innerText}**`; // Mark it with ** so we can detect it
        }

        const nodeProps = node.props as { children?: any };
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

    // Check if content has bullets (- or \-) or bold markers (** or \*\*)
    const hasBullets =
      textContent.includes(" - ") || textContent.includes("\\-");
    const hasBold =
      textContent.includes("**") || textContent.includes("\\*\\*");

    // IMPORTANT: Only process if we have BOTH section headers AND bullets
    // Pattern: **Section** - bullet - bullet
    const hasSectionPattern = /\*\*([^*]+?)\*\*\s*-\s+/.test(
      textContent.replace(/\\\*\\\*/g, "**").replace(/\\-/g, "-")
    );

    // If no section pattern detected, just return content with simple bold processing
    if (!hasSectionPattern) {
      // Check if it's just simple bold text without bullets
      if (hasBold && !hasBullets) {
        const cleanText = textContent.replace(/\\\*\\\*/g, "**");
        if (cleanText.includes("**")) {
          const processedText: React.ReactNode[] = [];
          let lastIndex = 0;
          const boldRegex = /\*\*([^*]+?)\*\*/g;
          let match;

          while ((match = boldRegex.exec(cleanText)) !== null) {
            if (match.index > lastIndex) {
              processedText.push(cleanText.substring(lastIndex, match.index));
            }
            processedText.push(
              <strong key={`bold-${match.index}`}>{match[1]}</strong>
            );
            lastIndex = match.index + match[0].length;
          }

          if (lastIndex < cleanText.length) {
            processedText.push(cleanText.substring(lastIndex));
          }

          return <>{processedText}</>;
        }
      }

      // Return original content if no special processing needed
      return content;
    }

    // Clean up escaped markdown
    textContent = textContent.replace(/\\\*\\\*/g, "**");
    textContent = textContent.replace(/\\-/g, "-");

    // Parse with section pattern
    const elements: React.ReactNode[] = [];

    // First, split by pattern: **SectionHeader** followed by content
    // This regex finds: **text** - content - more content
    const sectionPattern = /\*\*([^*]+?)\*\*\s*-\s*/g;
    let lastIndex = 0;
    let match;

    while ((match = sectionPattern.exec(textContent)) !== null) {
      // Add any text before this section
      if (match.index > lastIndex) {
        const beforeText = textContent.substring(lastIndex, match.index).trim();
        if (beforeText) {
          // Process as regular bullets if it contains -
          if (beforeText.includes(" - ")) {
            const bullets = beforeText
              .split(" - ")
              .filter((b) => b.trim().length > 0);
            bullets.forEach((bullet, idx) => {
              elements.push(
                <li
                  key={`bullet-before-${lastIndex}-${idx}`}
                  className="!leading-relaxed"
                >
                  {bullet.trim()}
                </li>
              );
            });
          } else {
            elements.push(
              <li
                key={`bullet-before-${lastIndex}`}
                className="!leading-relaxed"
              >
                {beforeText}
              </li>
            );
          }
        }
      }

      // Add the section header
      const sectionTitle = match[1].trim();
      elements.push(
        <p
          key={`header-${match.index}`}
          className="!font-semibold !mt-4 !mb-2 !text-black"
        >
          {sectionTitle}
        </p>
      );

      lastIndex = match.index + match[0].length;
    }

    // Process remaining content after last section
    if (lastIndex < textContent.length) {
      const remainingText = textContent.substring(lastIndex).trim();
      if (remainingText) {
        // Split by bullets
        const bullets = remainingText
          .split(" - ")
          .filter((b) => b.trim().length > 0);
        bullets.forEach((bullet, idx) => {
          const trimmedBullet = bullet.trim();

          // Check for inline bold
          if (trimmedBullet.includes("**")) {
            const processedText: React.ReactNode[] = [];
            let bulletLastIndex = 0;
            const boldRegex = /\*\*([^*]+?)\*\*/g;
            let boldMatch;

            while ((boldMatch = boldRegex.exec(trimmedBullet)) !== null) {
              if (boldMatch.index > bulletLastIndex) {
                processedText.push(
                  trimmedBullet.substring(bulletLastIndex, boldMatch.index)
                );
              }
              processedText.push(
                <strong key={`bold-${idx}-${boldMatch.index}`}>
                  {boldMatch[1]}
                </strong>
              );
              bulletLastIndex = boldMatch.index + boldMatch[0].length;
            }

            if (bulletLastIndex < trimmedBullet.length) {
              processedText.push(trimmedBullet.substring(bulletLastIndex));
            }

            elements.push(
              <li key={`bullet-remaining-${idx}`} className="!leading-relaxed">
                {processedText}
              </li>
            );
          } else {
            elements.push(
              <li key={`bullet-remaining-${idx}`} className="!leading-relaxed">
                {trimmedBullet}
              </li>
            );
          }
        });
      }
    }

    // If we found sections and bullets, wrap in ul
    if (elements.length > 0) {
      // Group consecutive li elements into ul elements
      const grouped: React.ReactNode[] = [];
      let currentBullets: React.ReactElement[] = [];

      elements.forEach((element, idx) => {
        if (React.isValidElement(element) && element.type === "li") {
          currentBullets.push(element);
        } else {
          // Flush current bullets
          if (currentBullets.length > 0) {
            grouped.push(
              <ul
                key={`ul-${grouped.length}`}
                className="!list-disc !pl-5 !space-y-2"
              >
                {currentBullets}
              </ul>
            );
            currentBullets = [];
          }
          grouped.push(element);
        }
      });

      // Flush remaining bullets
      if (currentBullets.length > 0) {
        grouped.push(
          <ul
            key={`ul-${grouped.length}`}
            className="!list-disc !pl-5 !space-y-2"
          >
            {currentBullets}
          </ul>
        );
      }

      return <>{grouped}</>;
    }

    return content;
  };

  // Helper function to render regular tables with multiple column headers
  const renderRegularTable = (
    headerCells: React.ReactNode[],
    bodyRows: React.ReactNode[]
  ) => {
    // Extract header text from cells
    const headers = headerCells.map((cell) => {
      if (!React.isValidElement(cell)) return "";
      const cellProps = (cell.props as any).children;

      // Handle different types of children content
      if (typeof cellProps === "string") {
        return cellProps;
      }
      if (Array.isArray(cellProps)) {
        return cellProps.map((c) => (typeof c === "string" ? c : "")).join("");
      }
      if (React.isValidElement(cellProps)) {
        const nestedProps = (cellProps.props as any).children;
        return String(nestedProps || "");
      }

      return String(cellProps || "");
    });

    // Process body rows with proper cell styling
    const processedRows = bodyRows.map((row, rowIdx) => {
      if (!React.isValidElement(row)) return row;

      const rowProps = row.props as { children?: React.ReactNode };
      const cells = React.Children.toArray(rowProps.children);

      const processedCells = cells.map((cell, cellIdx) => {
        if (!React.isValidElement(cell)) return cell;

        const cellProps = cell.props as { children?: React.ReactNode };

        return (
          <td
            key={cellIdx}
            className={`!pl-8 !pr-4 !py-6 !text-sm !align-top !bg-white !border !border-[#6CBA8C]`}
          >
            {processContent(cellProps.children)}
          </td>
        );
      });

      return (
        <tr key={rowIdx} className="!border !border-[#6CBA8C]">
          {processedCells}
        </tr>
      );
    });

    return (
      <div
        className="!my-8 !overflow-hidden !border !border-gray-300"
        style={{ borderRadius: "8px 36px 0 0" }}
      >
        <table
          className="!w-full !my-0"
          style={{ borderCollapse: "collapse", borderSpacing: 0 }}
        >
          <thead className="!bg-[#EDEBED]/50">
            <tr>
              {headers.map((header, idx) => (
                <th
                  key={idx}
                  className={`!pl-8 !pr-4 !py-5 !bg-[#EDEBED]/50 !text-left !font-semibold !text-base !text-black !border-b !border-gray-300 ${
                    idx < headers.length - 1 ? "!border-r !border-gray-300" : ""
                  }`}
                >
                  {header || `Header ${idx + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="!bg-white">{processedRows}</tbody>
        </table>
      </div>
    );
  };

  // Check if this is a regular table with thead headers (not the special merged format)
  // Regular table: thead has actual column headers (not title/subtitle)
  const theadRows = React.Children.toArray(theadProps.children);
  if (theadRows.length > 0) {
    const theadRow = theadRows[0];
    if (React.isValidElement(theadRow)) {
      const theadCells = React.Children.toArray(
        (theadRow.props as any).children
      );

      // Check if there are multiple cells with content in thead (indicating column headers)
      const nonEmptyCells = theadCells.filter((cell) => {
        if (!React.isValidElement(cell)) return false;
        const cellProps = (cell.props as any).children;
        const cellText =
          typeof cellProps === "string"
            ? cellProps.trim()
            : String(cellProps || "").trim();
        return cellText.length > 0;
      });

      // If there are 2+ non-empty cells in thead, it's a regular table
      if (nonEmptyCells.length >= 2) {
        return renderRegularTable(theadCells, tbodyRows);
      }

      // Check if first cell has content and other cells are empty
      const firstCellContent = React.isValidElement(theadCells[0])
        ? (theadCells[0].props as any).children
        : "";
      const firstCellText =
        typeof firstCellContent === "string"
          ? firstCellContent.trim()
          : String(firstCellContent || "").trim();

      // Check if first cell has content and other cells are empty or mostly empty
      const otherCellsHaveContent = theadCells.slice(1).some((cell) => {
        if (!React.isValidElement(cell)) return false;
        const cellProps = (cell.props as any).children;
        const cellText =
          typeof cellProps === "string"
            ? cellProps.trim()
            : String(cellProps || "").trim();
        return cellText.length > 0;
      });

      // If first cell has content and others are empty, AND no strong tags in first tbody row
      // This is a title-style table where all tbody rows are data
      if (
        firstCellText.length > 0 &&
        !otherCellsHaveContent &&
        !hasStrongInFirstRow &&
        tbodyRows.length > 0
      ) {
        // Extract raw text from first thead cell
        const rawText = extractRawText(firstCellContent);

        // All tbody rows are data rows (no headers row)
        // Process all rows as data
        const processedDataRows = tbodyRows.map((row, rowIdx) => {
          if (!React.isValidElement(row)) return row;
          const rowProps = row.props as { children?: React.ReactNode };
          const cells = React.Children.toArray(rowProps.children);

          const processedCells = cells.map((cell, cellIdx) => {
            if (!React.isValidElement(cell)) return cell;
            const cellProps = cell.props as { children?: React.ReactNode };
            const isLastCell = cellIdx === cells.length - 1;

            return (
              <td
                key={cellIdx}
                className={`!pl-8 !pr-4 !py-6 !text-sm !align-top !bg-white ${
                  !isLastCell ? "!border-r !border-[#6CBA8C]" : ""
                }`}
              >
                {processContent(cellProps.children)}
              </td>
            );
          });

          return (
            <tr
              key={rowIdx}
              className="!border-b !border-[#6CBA8C] last:!border-b-0"
            >
              {processedCells}
            </tr>
          );
        });

        return (
          <div
            className="!my-8 !overflow-hidden !border !border-gray-300"
            style={{ borderRadius: "8px 36px 0 0" }}
          >
            {/* Title section - Green rounded top with markdown support */}
            <div
              className="!bg-[#92C36F] !px-8 !py-6"
              style={{ borderRadius: "8px 36px 0 0" }}
            >
              {parseHeaderMarkdown(rawText)}
            </div>
            {/* Table with data rows only (no column headers) */}
            <table
              className="!w-full !border-collapse !my-0"
              style={{ borderSpacing: 0 }}
            >
              <tbody className="!bg-white">{processedDataRows}</tbody>
            </table>
          </div>
        );
      }
    }
  }

  // If no strong tags in first row, this is not our special table format
  if (!hasStrongInFirstRow) {
    return null;
  }

  // Extract title from thead
  const theadRow = theadRows[0];
  let rawHeaderText = "";

  if (React.isValidElement(theadRow)) {
    const theadCells = React.Children.toArray((theadRow.props as any).children);
    if (theadCells.length > 0 && React.isValidElement(theadCells[0])) {
      const cellContent = (theadCells[0].props as any).children;
      rawHeaderText = extractRawText(cellContent);
    }
  }

  // Extract actual column headers from first tbody row
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

  const headerCells = firstRowCells.map((cell) => extractStrongText(cell));

  // Get remaining data rows (skip first row which was headers)
  const dataRows = tbodyRows.slice(1);

  // Process data rows to apply proper styling
  const processedDataRows = dataRows.map((row, rowIdx) => {
    if (!React.isValidElement(row)) return row;

    const rowProps = row.props as { children?: React.ReactNode };
    const cells = React.Children.toArray(rowProps.children);

    const processedCells = cells.map((cell, cellIdx) => {
      if (!React.isValidElement(cell)) return cell;

      const cellProps = cell.props as { children?: React.ReactNode };

      return (
        <td
          key={cellIdx}
          className={`!pl-8 !pr-4 !py-6 !text-sm !align-top !bg-white !border !border-[#6CBA8C]`}
        >
          {processContent(cellProps.children)}
        </td>
      );
    });

    return (
      <tr key={rowIdx} className="!border !border-[#6CBA8C]">
        {processedCells}
      </tr>
    );
  });

  return (
    <div
      className="!my-8 !overflow-hidden !border !border-gray-300"
      style={{ borderRadius: "8px 36px 0 0" }}
    >
      {/* Title section - Green rounded top with markdown support */}
      <div
        className="!bg-[#92C36F] !px-6 !py-5"
        style={{ borderRadius: "8px 36px 0 0" }}
      >
        {parseHeaderMarkdown(rawHeaderText)}
      </div>
      {/* Table with actual headers and data */}
      <table
        className="!my-0 !w-full"
        style={{ borderCollapse: "collapse", borderSpacing: 0 }}
      >
        <thead className="!bg-[#EDEBED]">
          <tr>
            {headerCells.map((header, idx) => (
              <th
                key={idx}
                className={`!pl-5 !py-2 !bg-[#EDEBED]/50 !text-left !font-semibold !text-base !text-black !border !border-gray-300 !border-b-0`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="!bg-white">{processedDataRows}</tbody>
      </table>
    </div>
  );
}

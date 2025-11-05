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
 * - Green rounded header section with title and subtitle
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

  // Process cell content to handle bullet points
  const processContent = (content: React.ReactNode): React.ReactNode => {
    // Extract text content from children
    let textContent = "";
    if (typeof content === "string") {
      textContent = content;
    } else if (React.isValidElement(content)) {
      const contentProps = content.props as { children?: any };
      if (typeof contentProps.children === "string") {
        textContent = contentProps.children;
      }
    } else if (Array.isArray(content)) {
      textContent = content
        .map((c) => {
          if (typeof c === "string") return c;
          if (React.isValidElement(c)) {
            const cProps = c.props as { children?: any };
            return typeof cProps.children === "string" ? cProps.children : "";
          }
          return "";
        })
        .join("");
    }

    if (textContent) {
      // Check for bullet pattern: "- " or "\- "
      const bulletPattern = /(?:^|\s)[-−–—]\s+/m;
      const hasBullets = bulletPattern.test(textContent);

      if (hasBullets) {
        // Split by various bullet markers
        const parts = textContent.split(/\s*[-−–—]\s+/).filter(Boolean);

        return (
          <ul className="!list-disc !pl-5 !space-y-3">
            {parts.map((part, idx) => {
              // Check if this part contains **text** pattern (bold headers like "Procurement risks")
              const boldMatch = part.match(/\*\*([^*]+)\*\*/);
              if (boldMatch && part.trim() === boldMatch[0]) {
                return (
                  <p
                    key={idx}
                    className="!font-semibold !mt-4 !mb-2 !text-black"
                  >
                    {boldMatch[1]}
                  </p>
                );
              }
              return (
                <li key={idx} className="!leading-relaxed">
                  {part.trim()}
                </li>
              );
            })}
          </ul>
        );
      }
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
        <tr
          key={rowIdx}
          className="!border !border-[#6CBA8C]"
        >
          {processedCells}
        </tr>
      );
    });

    return (
      <div
        className="!my-8 !overflow-hidden !border !border-gray-300 !rounded-[12px]"
      >
        <table
          className="!w-full"
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
  const theadRow = theadRows[0];

  if (React.isValidElement(theadRow)) {
    const theadCells = React.Children.toArray((theadRow.props as any).children);

    // Check if thead has 2+ cells with content (regular table with column headers)
    if (theadCells.length >= 2) {
      const hasMultipleHeaders =
        theadCells.filter((cell) => {
          if (!React.isValidElement(cell)) return false;
          const cellProps = (cell.props as any).children;
          return cellProps && String(cellProps).trim().length > 0;
        }).length >= 2;

      // If thead has multiple actual column headers (2+), this is a regular table
      // In this case, ALL tbody rows are data (not headers)
      if (hasMultipleHeaders) {
        // This is a regular table with proper thead headers
        return renderRegularTable(theadCells, tbodyRows);
      }
    }
  }

  // If no strong tags in first row, this is not our special table format
  if (!hasStrongInFirstRow) {
    return null;
  }

  // Extract title and subtitle from thead
  let title = "";
  let subtitle = "";

  if (React.isValidElement(theadRow)) {
    const theadCells = React.Children.toArray((theadRow.props as any).children);
    if (theadCells.length > 0 && React.isValidElement(theadCells[0])) {
      const cellContent = (theadCells[0].props as any).children;
      if (typeof cellContent === "string") {
        // Split on common patterns for objective/subtitle
        const patterns = [
          "Procurement and organization objective:",
          "objective:",
          "Objective:",
        ];
        let matched = false;
        for (const pattern of patterns) {
          if (cellContent.includes(pattern)) {
            const parts = cellContent.split(pattern);
            title = parts[0]?.trim() || cellContent;
            subtitle = "Objective: " + (parts[1]?.trim() || "");
            matched = true;
            break;
          }
        }
        if (!matched) {
          title = cellContent.trim();
        }
      }
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
      <tr
        key={rowIdx}
        className="!border !border-[#6CBA8C]"
      >
        {processedCells}
      </tr>
    );
  });

  return (
    <div
      className="!my-8 !overflow-hidden !border !border-gray-300 !rounded-[12px]"
    >
      {/* Title section - Green rounded top */}
      <div
        className="!bg-[#92C36F] !px-6 !py-5 !rounded-t-[12px]"
      >
        <h3 className="!text-2xl !font-bold !text-black !mb-2 !font-gteesti-display">
          {title}
        </h3>
        {subtitle && (
          <p className="!text-base !text-black !leading-relaxed">{subtitle}</p>
        )}
      </div>
      {/* Table with actual headers and data */}
      <table
        className="!my-0 mb-0.5 !w-full"
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

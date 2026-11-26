import React from "react";
import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import procurementPathwaysData from "@/app/data/procurement-pathways.json";
import { CustomTable } from "@/components/CustomTable";
import ProcurementPathways from "@/components/ProcurementPathways";
import { processChapterContent, remarkHeadingIds } from "@/lib/chapter-content";

interface ChapterContentProps {
  content: string;
  highlightColor: string;
  print?: boolean;
}

const PROSE_CLASSES = `prose prose-slate max-w-none
  prose-headings:font-bold prose-headings:font-gteesti-display
  prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-0
  prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8
  prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
  prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-p:text-base
  prose-a:text-[#17736B] prose-a:underline prose-a:font-medium
  prose-strong:text-gray-900 prose-strong:font-semibold
  prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
  prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
  prose-li:text-gray-700 prose-li:mb-2
  prose-blockquote:border-l-4 prose-blockquote:border-[#D6E100] prose-blockquote:pl-4 prose-blockquote:italic
  prose-code:bg-transparent prose-code:p-0
  prose-img:rounded-lg prose-img:shadow-md
  prose-hr:border-gray-200 prose-hr:my-8
  prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:my-4 sm:prose-table:my-6
  prose-th:border prose-th:border-gray-300 prose-th:px-2 sm:prose-th:px-4 prose-th:py-1.5 sm:prose-th:py-2 prose-th:text-left prose-th:font-medium prose-th:text-xs sm:prose-th:text-sm
  prose-td:border prose-td:border-gray-300 prose-td:px-2 sm:prose-td:px-4 prose-td:py-1.5 sm:prose-td:py-2 prose-td:text-xs sm:prose-td:text-sm
  prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:overflow-visible`;

const IMAGE_STYLE: React.CSSProperties = {
  maxWidth: "100%",
  width: "auto",
  height: "auto",
  display: "block",
  marginLeft: "auto",
  marginRight: "auto",
  imageRendering: "auto",
  objectFit: "contain",
};

function imageLoading(print: boolean) {
  return print ? {} : ({ loading: "lazy", decoding: "async", fetchPriority: "high" } as const);
}

// Replace <em> and <i> with a non-italic span highlighted in the section's color.
function wrapItalicWithBackground(node: React.ReactNode, backgroundColor: string): React.ReactNode {
  if (!node || typeof node === "string") {
    return node;
  }

  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode };
    if (node.type === "em" || node.type === "i") {
      return (
        <span className="px-1 py-0.5 rounded not-italic" style={{ backgroundColor }}>
          {props?.children}
        </span>
      );
    }
    if (props?.children) {
      const children = React.Children.toArray(props.children).map((child) =>
        wrapItalicWithBackground(child, backgroundColor),
      );
      return React.cloneElement(node as React.ReactElement<{ children?: React.ReactNode }>, { children });
    }
  }

  if (Array.isArray(node)) {
    return node.map((item, index) => {
      const processed = wrapItalicWithBackground(item, backgroundColor);
      return React.isValidElement(processed) ? React.cloneElement(processed, { key: `italic-${index}` }) : processed;
    });
  }

  return node;
}

// Render a fenced code block as a Who/What box or a callout box. Other code blocks are hidden.
function renderPre({ children }: React.ComponentProps<"pre"> & ExtraProps) {
  let content = "";
  if (typeof children === "string") {
    content = children;
  } else if (React.isValidElement(children)) {
    const childProps = children.props as { children?: string };
    if (childProps.children) {
      content = String(childProps.children);
    }
  }

  content = content.trim();
  if (!content) {
    return null;
  }

  let lines = content.split("\n");
  let icon: string | null = null;
  let background = "green";

  // YAML-like frontmatter sets the icon and background.
  if (lines[0] === "---") {
    const endIndex = lines.findIndex((line, i) => i > 0 && line === "---");
    if (endIndex > 0) {
      lines.slice(1, endIndex).forEach((line) => {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
          const [, key, value] = match;
          if (key === "icon") {
            icon = value.trim();
          } else if (key === "background") {
            background = value.trim();
          }
        }
      });
      lines = lines.slice(endIndex + 1);
    }
  }

  const whoLine = lines.find((line) => line.trim().startsWith("- Who:"));
  const whatLine = lines.find((line) => line.trim().startsWith("- What:"));

  if (whoLine && whatLine) {
    const labelStyle: React.CSSProperties = {
      width: "80px",
      fontWeight: "bold",
      color: "#323232",
      fontSize: "1.125rem",
      paddingRight: "1.5rem",
      verticalAlign: "top",
      border: "none",
    };
    const valueStyle: React.CSSProperties = {
      color: "#1f2937",
      fontSize: "1rem",
      border: "none",
      wordWrap: "break-word",
      overflowWrap: "break-word",
    };
    return (
      <div className="not-prose my-6 px-8 py-5 bg-[#F5F7E6] rounded-2xl">
        <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ ...labelStyle, paddingBottom: "0.75rem" }}>Who</td>
              <td style={{ ...valueStyle, paddingBottom: "0.75rem" }}>{whoLine.replace(/^-\s*Who:\s*/, "").trim()}</td>
            </tr>
            <tr>
              <td style={labelStyle}>What</td>
              <td style={valueStyle}>{whatLine.replace(/^-\s*What:\s*/, "").trim()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  const hasBullets = lines.some((line) => line.trim().startsWith("-"));

  // The title is the first non-empty line, only if it is a heading.
  let title = "";
  let contentStartIndex = 0;
  let hasHeading = false;
  for (let i = 0; i < lines.length; i++) {
    const trimmedLine = lines[i].trim();
    if (!trimmedLine) continue;
    const headingMatch = trimmedLine.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      title = headingMatch[1];
      contentStartIndex = i + 1;
      hasHeading = true;
    }
    break;
  }

  if ((icon && lines.length > 0) || (hasHeading && hasBullets)) {
    const body = lines
      .slice(hasHeading ? contentStartIndex : 0)
      .join("\n")
      .trim();
    const bgColor = background === "grey" || background === "gray" ? "#E5E7EB" : "#F5F7E6";

    return (
      <div className="my-8 -mx-12 px-12 py-6 relative" style={{ backgroundColor: bgColor }}>
        {icon && <img src={`/icons/${icon}.png`} alt="" className="absolute top-6 left-12 w-12 h-12 !shadow-none" />}
        <div
          className={`prose prose-sm max-w-none prose-headings:font-gteesti-display prose-headings:mb-4 prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-li:text-gray-700 prose-li:leading-relaxed prose-p:my-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#17736B] prose-a:underline ${
            icon ? "ml-16" : ""
          }`}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkHeadingIds]}>
            {title ? `### ${title}\n\n${body}` : body}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return null;
}

function markdownComponents(highlightColor: string, print: boolean): Components {
  const heading =
    (Tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6") =>
    ({ children, className, id, node, ...props }: React.ComponentProps<"h1"> & ExtraProps) => (
      <Tag
        {...props}
        id={id}
        className={`${className || ""} font-gteesti-display`}
        style={{ scrollMarginTop: "200px" }}
      >
        {wrapItalicWithBackground(children, highlightColor)}
      </Tag>
    );

  return {
    img: ({ src, alt, node, ...props }) => {
      const srcString = typeof src === "string" ? src : String(src || "");
      if (!srcString) return null;
      return (
        <img
          src={srcString}
          alt={alt || ""}
          {...props}
          className="rounded-lg shadow-md"
          style={IMAGE_STYLE}
          {...imageLoading(print)}
        />
      );
    },
    h1: heading("h1"),
    h2: heading("h2"),
    h3: heading("h3"),
    h4: heading("h4"),
    h5: heading("h5"),
    h6: heading("h6"),
    pre: renderPre,
    // Tables that CustomTable doesn't render keep the prose styles.
    table: ({ children }) =>
      CustomTable({ children }) ?? (
        <div className="overflow-x-auto">
          <table>{children}</table>
        </div>
      ),
  };
}

// `print` expands interactive content and loads images eagerly.
export function ChapterContent({ content, highlightColor, print = false }: ChapterContentProps) {
  const components = markdownComponents(highlightColor, print);

  return (
    <div className={print ? `${PROSE_CLASSES} print-prose` : PROSE_CLASSES}>
      {processChapterContent(content).map((part, index) => {
        if (part.type === "image") {
          return (
            <img
              key={`image-${index}`}
              src={part.url}
              alt={part.alt}
              className="rounded-lg shadow-md my-4"
              style={IMAGE_STYLE}
              {...imageLoading(print)}
            />
          );
        }
        if (part.type === "procurement-pathways") {
          return (
            <div key={`procurement-pathways-${index}`} className="my-8 -mx-4 sm:-mx-8 lg:-mx-12">
              <ProcurementPathways data={procurementPathwaysData} expanded={print} />
            </div>
          );
        }
        return (
          <ReactMarkdown
            key={`markdown-${index}`}
            remarkPlugins={[remarkGfm, remarkHeadingIds]}
            rehypePlugins={[rehypeRaw]}
            components={components}
          >
            {part.content}
          </ReactMarkdown>
        );
      })}
    </div>
  );
}

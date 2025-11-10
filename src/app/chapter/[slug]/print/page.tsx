import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import React, { Suspense } from "react";
import Image from "next/image";
import logo from "@/app/assets/images/logo.svg";
import { getChapterBySlug } from "@/lib/markdown";
import { getChapterInSection, getSectionColor } from "@/lib/sections-types";
import { getSectionsStructure } from "@/lib/sections";
import { CollapsibleText } from "@/components/CollapsibleText";
import { CustomTable } from "@/components/CustomTable";
import { CollapsibleInitializer } from "@/components/CollapsibleInitializer";
import { PrintPageTrigger } from "@/components/PrintPageTrigger";
import { DownloadPDFButton } from "@/components/DownloadPDFButton";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Helper function to wrap italic elements with section background color
function wrapItalicWithBackground(
  node: React.ReactNode,
  backgroundColor: string
): React.ReactNode {
  if (!node) return node;

  if (typeof node === "string") {
    return node;
  }

  if (React.isValidElement(node)) {
    if (
      node.type === "em" ||
      node.type === "i" ||
      (typeof node.type === "string" && node.type.toLowerCase() === "em")
    ) {
      const props = node.props as { children?: React.ReactNode };
      return (
        <span
          className="px-1 py-0.5 rounded not-italic"
          style={{ backgroundColor }}
        >
          {props?.children}
        </span>
      );
    }

    const props = node.props as { children?: React.ReactNode };
    if (props?.children) {
      const children = React.Children.toArray(props.children);
      const processedChildren = children.map((child) =>
        wrapItalicWithBackground(child, backgroundColor)
      );
      return React.cloneElement(node as React.ReactElement<any>, {
        children: processedChildren,
      });
    }
  }

  if (Array.isArray(node)) {
    return node.map((item, index) => {
      const processed = wrapItalicWithBackground(item, backgroundColor);
      if (React.isValidElement(processed)) {
        return React.cloneElement(processed, { key: `italic-${index}` });
      }
      return processed;
    });
  }

  return node;
}

// Process markdown to resolve image references
function processMarkdownImageReferences(content: string): string {
  const imageRefs: Map<string, string> = new Map();
  const refPattern = /^\[([^\]]+)\]:\s*(.+)$/gm;
  let match;

  while ((match = refPattern.exec(content)) !== null) {
    const refId = match[1].toLowerCase().trim();
    let imageUrl = match[2].trim();

    if (imageUrl.startsWith("<") && imageUrl.endsWith(">")) {
      imageUrl = imageUrl.slice(1, -1);
    }

    if (imageUrl) {
      imageRefs.set(refId, imageUrl);
    }
  }

  let processedContent = content;

  imageRefs.forEach((imageUrl, refId) => {
    const escapedRefId = refId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const imageRefPattern = new RegExp(
      `!\\[(.*?)\\]\\[${escapedRefId}\\]`,
      "gi"
    );

    processedContent = processedContent.replace(
      imageRefPattern,
      (match, altText) => {
        return `![${altText || ""}](${imageUrl})`;
      }
    );

    const removePattern = new RegExp(`^\\[${escapedRefId}\\]:\\s*.+$`, "gim");
    processedContent = processedContent.replace(removePattern, "");
  });

  return processedContent;
}

// Generate static paths for all chapters
export async function generateStaticParams() {
  const { getAllChapters } = await import("@/lib/markdown");
  const chapters = getAllChapters();
  return chapters.map((chapter) => ({
    slug: chapter.slug,
  }));
}

export default async function PrintPage({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const structure = getSectionsStructure();
  const currentChapterInfo = getChapterInSection(structure, slug);
  const currentSection = currentChapterInfo?.section;
  const sectionColor = currentSection
    ? getSectionColor(currentSection.number)
    : getSectionColor(1);

  // Process collapsible sections
  let processedContent = chapter.content;

  // Pattern 1: h4 headings with {.collapsible}
  const h4CollapsibleRegex =
    /^####\s+\*\*(.*?)\s*\{\.collapsible\}\*\*\s*\n\n((?:(?!^#{1,4}\s|\n\n\n)[\s\S])*)/gm;

  processedContent = processedContent.replace(
    h4CollapsibleRegex,
    (match, title, content) => {
      const id = `collapsible-${Math.random().toString(36).substr(2, 9)}`;

      return `<div class="collapsible-wrapper" data-collapsible="true">
  <div class="collapsible-header" data-target="${id}">
    <svg class="collapsible-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
    </svg>
    <strong>${title.trim()}</strong>
  </div>
  <div class="collapsible-content" id="${id}" style="display: none;">

${content.trim()}

  </div>
</div>

`;
    }
  );

  // Pattern 2: Bullet points with {.collapsible}
  const bulletCollapsibleRegex =
    /^\*\s+\*\*(.*?)\s*\{\.collapsible\}\*\*\s*\n((?:(?:  .+|\s*)\n)*(?:  .+)?)/gm;

  processedContent = processedContent.replace(
    bulletCollapsibleRegex,
    (match, title, content) => {
      const id = `collapsible-${Math.random().toString(36).substr(2, 9)}`;
      const cleanContent = content.replace(/^  /gm, "").trim();

      return `<div class="collapsible-wrapper-bullet" data-collapsible="true">
  <div class="collapsible-header" data-target="${id}">
    <svg class="collapsible-icon" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
    </svg>
    <strong>${title.trim()}</strong>
  </div>
  <div class="collapsible-content" id="${id}" style="display: none;">

${cleanContent}

  </div>
</div>

`;
    }
  );

  // Process markdown to resolve image references
  processedContent = processMarkdownImageReferences(processedContent);

  // Split content by images
  const imagePattern = /!\[([^\]]*)\]\((data:[^)]+)\)/g;
  const contentParts: Array<
    | { type: "markdown"; content: string }
    | { type: "image"; url: string; alt: string }
  > = [];
  let lastIndex = 0;
  let match;

  while ((match = imagePattern.exec(processedContent)) !== null) {
    if (match.index > lastIndex) {
      contentParts.push({
        type: "markdown",
        content: processedContent.substring(lastIndex, match.index),
      });
    }

    contentParts.push({
      type: "image",
      url: match[2],
      alt: match[1] || "",
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < processedContent.length) {
    contentParts.push({
      type: "markdown",
      content: processedContent.substring(lastIndex),
    });
  }

  if (contentParts.length === 0) {
    contentParts.push({
      type: "markdown",
      content: processedContent,
    });
  }

  return (
    <div className="min-h-screen bg-white print-view-container">
      {/* Main Content */}
      <main className="print-content-wrapper px-8 py-8 max-w-4xl mx-auto">
        <article className="print-content">
          <div
            className="prose prose-slate max-w-none print-prose
            prose-headings:font-bold prose-headings:font-gteesti-display
            prose-h1:text-4xl prose-h1:mb-6 prose-h1:mt-0
            prose-h2:text-3xl prose-h2:mb-4 prose-h2:mt-8
            prose-h3:text-2xl prose-h3:mb-3 prose-h3:mt-6
            prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-[#23B2A7] prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
            prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-gray-700 prose-li:mb-2
            prose-blockquote:border-l-4 prose-blockquote:border-[#C8D419] prose-blockquote:pl-4 prose-blockquote:italic
            prose-code:bg-transparent prose-code:p-0
            prose-img:rounded-lg prose-img:shadow-md
            prose-hr:border-gray-200 prose-hr:my-8
            prose-table:border-collapse prose-table:border prose-table:border-gray-300 prose-table:my-6
            prose-th:border prose-th:border-gray-300 prose-th:bg-gray-50 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-medium prose-th:text-sm
            prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2 prose-td:text-sm
            prose-thead:bg-gray-50
            prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0 prose-pre:overflow-visible
          "
          >
            {contentParts.length > 0 ? (
              contentParts.map((part, index) => {
                if (part.type === "image") {
                  return (
                    <img
                      key={`image-${index}`}
                      src={part.url}
                      alt={part.alt || ""}
                      className="rounded-lg shadow-md my-4"
                      style={{
                        maxWidth: "100%",
                        width: "auto",
                        height: "auto",
                        display: "block",
                        marginLeft: "auto",
                        marginRight: "auto",
                        imageRendering: "auto",
                        objectFit: "contain",
                      }}
                    />
                  );
                } else {
                  return (
                    <ReactMarkdown
                      key={`markdown-${index}`}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={
                        {
                          collapsiblesection: ({
                            title,
                            heading,
                            children,
                          }: any) => (
                            <CollapsibleText title={title} heading={heading}>
                              {children}
                            </CollapsibleText>
                          ),
                          img: ({ src, alt, ...props }: any) => {
                            const srcString =
                              typeof src === "string" ? src : String(src || "");
                            if (!srcString) return null;
                            return (
                              <img
                                src={srcString}
                                alt={alt || ""}
                                {...props}
                                className="rounded-lg shadow-md"
                                style={{
                                  maxWidth: "100%",
                                  width: "auto",
                                  height: "auto",
                                  display: "block",
                                  marginLeft: "auto",
                                  marginRight: "auto",
                                  imageRendering: "auto",
                                  objectFit: "contain",
                                }}
                              />
                            );
                          },
                          h1: ({ children, className, ...props }: any) => {
                            const processedChildren =
                              wrapItalicWithBackground(
                                children,
                                sectionColor.bg
                              );
                            return (
                              <h1
                                {...props}
                                className={`${
                                  className || ""
                                } font-gteesti-display`}
                              >
                                {processedChildren}
                              </h1>
                            );
                          },
                          h2: ({ children, className, ...props }: any) => {
                            const processedChildren =
                              wrapItalicWithBackground(
                                children,
                                sectionColor.bg
                              );
                            return (
                              <h2
                                {...props}
                                className={`${
                                  className || ""
                                } font-gteesti-display`}
                              >
                                {processedChildren}
                              </h2>
                            );
                          },
                          h3: ({ children, className, ...props }: any) => {
                            const processedChildren =
                              wrapItalicWithBackground(
                                children,
                                sectionColor.bg
                              );
                            return (
                              <h3
                                {...props}
                                className={`${
                                  className || ""
                                } font-gteesti-display`}
                              >
                                {processedChildren}
                              </h3>
                            );
                          },
                          h4: ({ children, className, ...props }: any) => {
                            const processedChildren =
                              wrapItalicWithBackground(
                                children,
                                sectionColor.bg
                              );
                            return (
                              <h4
                                {...props}
                                className={`${
                                  className || ""
                                } font-gteesti-display`}
                              >
                                {processedChildren}
                              </h4>
                            );
                          },
                          h5: ({ children, className, ...props }: any) => {
                            const processedChildren =
                              wrapItalicWithBackground(
                                children,
                                sectionColor.bg
                              );
                            return (
                              <h5
                                {...props}
                                className={`${
                                  className || ""
                                } font-gteesti-display`}
                              >
                                {processedChildren}
                              </h5>
                            );
                          },
                          h6: ({ children, className, ...props }: any) => {
                            const processedChildren =
                              wrapItalicWithBackground(
                                children,
                                sectionColor.bg
                              );
                            return (
                              <h6
                                {...props}
                                className={`${
                                  className || ""
                                } font-gteesti-display`}
                              >
                                {processedChildren}
                              </h6>
                            );
                          },
                          pre: ({ children, ...props }: any) => {
                            let content = "";
                            if (typeof children === "string") {
                              content = children;
                            } else if (React.isValidElement(children)) {
                              const childProps = children.props as {
                                children?: string;
                              };
                              if (childProps.children) {
                                content = String(childProps.children);
                              }
                            }

                            content = content.trim();
                            if (!content) {
                              return null;
                            }

                            let lines = content.split("\n");

                            // Parse YAML frontmatter if present
                            let icon = null;
                            let background = "green";

                            if (lines[0] === "---") {
                              const endIndex = lines.findIndex(
                                (line, i) => i > 0 && line === "---"
                              );
                              if (endIndex > 0) {
                                const frontmatter = lines.slice(1, endIndex);
                                frontmatter.forEach((line) => {
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

                            // Check if it's a Who/What box
                            const whoLine = lines.find((line) =>
                              line.trim().startsWith("- Who:")
                            );
                            const whatLine = lines.find((line) =>
                              line.trim().startsWith("- What:")
                            );

                            if (whoLine && whatLine) {
                              const whoContent = whoLine
                                .replace(/^-\s*Who:\s*/, "")
                                .trim();
                              const whatContent = whatLine
                                .replace(/^-\s*What:\s*/, "")
                                .trim();

                              return (
                                <div className="not-prose my-6 px-8 py-5 bg-[#F5F7E6] rounded-2xl">
                                  <table
                                    style={{
                                      width: "100%",
                                      tableLayout: "fixed",
                                      borderCollapse: "collapse",
                                    }}
                                  >
                                    <tbody>
                                      <tr>
                                        <td
                                          style={{
                                            width: "80px",
                                            fontWeight: "bold",
                                            color: "#8B9A2E",
                                            fontSize: "1.125rem",
                                            paddingRight: "1.5rem",
                                            verticalAlign: "top",
                                            paddingBottom: "0.75rem",
                                            border: "none",
                                          }}
                                        >
                                          Who
                                        </td>
                                        <td
                                          style={{
                                            color: "#1f2937",
                                            fontSize: "1rem",
                                            paddingBottom: "0.75rem",
                                            border: "none",
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                          }}
                                        >
                                          {whoContent}
                                        </td>
                                      </tr>
                                      <tr>
                                        <td
                                          style={{
                                            width: "80px",
                                            fontWeight: "bold",
                                            color: "#8B9A2E",
                                            fontSize: "1.125rem",
                                            paddingRight: "1.5rem",
                                            verticalAlign: "top",
                                            border: "none",
                                          }}
                                        >
                                          What
                                        </td>
                                        <td
                                          style={{
                                            color: "#1f2937",
                                            fontSize: "1rem",
                                            border: "none",
                                            wordWrap: "break-word",
                                            overflowWrap: "break-word",
                                          }}
                                        >
                                          {whatContent}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }

                            // Check if it's a resource/info box
                            const hasBullets = lines.some((line) =>
                              line.trim().startsWith("-")
                            );

                            let title = "";
                            let contentStartIndex = 0;
                            let hasHeading = false;

                            for (let i = 0; i < lines.length; i++) {
                              const trimmedLine = lines[i].trim();
                              if (!trimmedLine) continue;

                              const headingMatch =
                                trimmedLine.match(/^#{1,6}\s+(.+)$/);
                              if (headingMatch) {
                                title = headingMatch[1];
                                contentStartIndex = i + 1;
                                hasHeading = true;
                                break;
                              }

                              break;
                            }

                            if (
                              (icon && lines.length > 0) ||
                              (hasHeading && hasBullets)
                            ) {
                              const content = hasHeading
                                ? lines
                                    .slice(contentStartIndex)
                                    .join("\n")
                                    .trim()
                                : lines.join("\n").trim();

                              const bgColor =
                                background === "grey" || background === "gray"
                                  ? "#E5E7EB"
                                  : "#F5F7E6";

                              return (
                                <div
                                  className="my-8 -mx-12 px-12 py-6 relative"
                                  style={{ backgroundColor: bgColor }}
                                >
                                  {icon && (
                                    <img
                                      src={`/icons/${icon}.png`}
                                      alt=""
                                      className="absolute top-6 left-12 w-12 h-12 !shadow-none"
                                    />
                                  )}
                                  <div
                                    className={`prose prose-sm max-w-none prose-headings:font-gteesti-display prose-headings:mb-4 prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-li:text-gray-700 prose-li:leading-relaxed prose-p:my-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#23B2A7] prose-a:no-underline hover:prose-a:underline ${
                                      icon ? "ml-16" : ""
                                    }`}
                                  >
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {title
                                        ? `### ${title}\n\n${content}`
                                        : content}
                                    </ReactMarkdown>
                                  </div>
                                </div>
                              );
                            }

                            return null;
                          },
                          code: ({ inline, children, ...props }: any) => {
                            if (inline) {
                              return (
                                <code
                                  className="bg-gray-100 px-1 py-0.5 rounded text-sm"
                                  {...props}
                                >
                                  {children}
                                </code>
                              );
                            }
                            return <code {...props}>{children}</code>;
                          },
                          table: ({ children, ...props }: any) => {
                            const customTable = CustomTable({ children });
                            if (customTable !== null) {
                              return customTable;
                            }

                            const hasOnlyHeaders = React.Children.toArray(
                              children
                            ).every((child) => {
                              if (
                                React.isValidElement(child) &&
                                child.type === "thead"
                              ) {
                                return true;
                              }
                              if (
                                React.isValidElement(child) &&
                                child.type === "tbody"
                              ) {
                                const childProps = child.props as {
                                  children?: React.ReactNode;
                                };
                                const tbodyChildren = React.Children.toArray(
                                  childProps.children
                                );
                                return (
                                  tbodyChildren.length === 0 ||
                                  tbodyChildren.every((tr) => {
                                    if (
                                      !React.isValidElement(tr) ||
                                      tr.type !== "tr"
                                    )
                                      return false;
                                    const trProps = tr.props as {
                                      children?: React.ReactNode;
                                    };
                                    return React.Children.toArray(
                                      trProps.children
                                    ).every((td) => {
                                      if (
                                        !React.isValidElement(td) ||
                                        td.type !== "td"
                                      )
                                        return false;
                                      const tdProps = td.props as {
                                        children?: React.ReactNode;
                                      };
                                      return (
                                        !tdProps.children ||
                                        (typeof tdProps.children === "string" &&
                                          tdProps.children.trim() === "") ||
                                        (Array.isArray(tdProps.children) &&
                                          tdProps.children.every(
                                            (c) =>
                                              typeof c === "string" &&
                                              c.trim() === ""
                                          ))
                                      );
                                    });
                                  })
                                );
                              }
                              return false;
                            });

                            if (hasOnlyHeaders) {
                              return (
                                <div className="my-6 px-6 py-4 bg-[#F5F7E6] border-l-4 border-[#8B9A2E] rounded-xl">
                                  <table className="w-full" {...props}>
                                    {children}
                                  </table>
                                </div>
                              );
                            }

                            return (
                              <div className="my-8 overflow-hidden rounded-lg border border-gray-300">
                                <table
                                  className="w-full border-collapse"
                                  {...props}
                                >
                                  {children}
                                </table>
                              </div>
                            );
                          },
                          thead: ({ children, ...props }: any) => {
                            return (
                              <thead className="bg-[#92C36F]" {...props}>
                                {children}
                              </thead>
                            );
                          },
                          th: ({ children, ...props }: any) => {
                            return (
                              <th
                                className="px-6 py-4 text-left font-semibold text-base text-black border-b border-gray-300"
                                {...props}
                              >
                                {children}
                              </th>
                            );
                          },
                          tr: ({ children, ...props }: any) => {
                            return (
                              <tr
                                className="border-b border-gray-300 last:border-b-0"
                                {...props}
                              >
                                {children}
                              </tr>
                            );
                          },
                          td: ({ children, ...props }: any) => {
                            const processContent = (
                              content: React.ReactNode
                            ): React.ReactNode => {
                              let textContent = "";
                              if (typeof content === "string") {
                                textContent = content;
                              } else if (React.isValidElement(content)) {
                                const contentProps = content.props as {
                                  children?: any;
                                };
                                if (typeof contentProps.children === "string") {
                                  textContent = contentProps.children;
                                }
                              } else if (Array.isArray(content)) {
                                textContent = content
                                  .map((c) => {
                                    if (typeof c === "string") return c;
                                    if (React.isValidElement(c)) {
                                      const cProps = c.props as {
                                        children?: any;
                                      };
                                      return typeof cProps.children === "string"
                                        ? cProps.children
                                        : "";
                                    }
                                    return "";
                                  })
                                  .join("");
                              }

                              if (textContent) {
                                const bulletPattern = /(?:^|\s)[-−–—]\s+/m;
                                const hasBullets =
                                  bulletPattern.test(textContent);

                                if (hasBullets) {
                                  const parts = textContent
                                    .split(/\s*[-−–—]\s+/)
                                    .filter(Boolean);

                                  return (
                                    <ul className="list-disc pl-5 space-y-2">
                                      {parts.map((part, idx) => {
                                        const boldMatch =
                                          part.match(/\*\*([^*]+)\*\*/);
                                        if (
                                          boldMatch &&
                                          part.trim() === boldMatch[0]
                                        ) {
                                          return (
                                            <p
                                              key={idx}
                                              className="font-semibold mt-3 mb-1 text-black"
                                            >
                                              {boldMatch[1]}
                                            </p>
                                          );
                                        }
                                        return <li key={idx}>{part.trim()}</li>;
                                      })}
                                    </ul>
                                  );
                                }
                              }

                              return content;
                            };

                            return (
                              <td
                                className="pl-8 pr-4 py-4 text-sm align-top bg-white"
                                {...props}
                              >
                                {processContent(children)}
                              </td>
                            );
                          },
                        } as any
                      }
                    >
                      {part.content}
                    </ReactMarkdown>
                  );
                }
              })
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={
                  {
                    collapsiblesection: ({ title, children }: any) => (
                      <CollapsibleText title={title}>
                        {children}
                      </CollapsibleText>
                    ),
                  } as any
                }
              >
                {processedContent}
              </ReactMarkdown>
            )}
          </div>
        </article>
      </main>

      <CollapsibleInitializer />
      <Suspense fallback={null}>
        <PrintPageTrigger />
      </Suspense>
      <DownloadPDFButton slug={slug} />
    </div>
  );
}


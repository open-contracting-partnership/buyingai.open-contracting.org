import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import React from "react";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CollapsibleText } from "@/components/CollapsibleText";

// Helper function to check if a React node contains italic text
function hasItalic(node: React.ReactNode): boolean {
  if (!node) return false;

  // If it's a string, check for markdown italic markers
  if (typeof node === "string") {
    return /[*_].+?[*_]/.test(node);
  }

  // If it's a React element, check its type and children
  if (React.isValidElement(node)) {
    // Check if it's an <em> or <i> tag
    if (
      node.type === "em" ||
      node.type === "i" ||
      (typeof node.type === "string" && node.type.toLowerCase() === "em")
    ) {
      return true;
    }

    // Check children recursively
    const props = node.props as { children?: React.ReactNode };
    if (props?.children) {
      const children = React.Children.toArray(props.children);
      return children.some((child) => hasItalic(child));
    }
  }

  // If it's an array, check all items
  if (Array.isArray(node)) {
    return node.some((item) => hasItalic(item));
  }

  return false;
}

// Helper function to wrap italic elements with green background
function wrapItalicWithBackground(node: React.ReactNode): React.ReactNode {
  if (!node) return node;

  // If it's a string, return as is (strings are not italic elements)
  if (typeof node === "string") {
    return node;
  }

  // If it's an <em> or <i> element, replace it with a span with green background (no italic)
  if (React.isValidElement(node)) {
    if (
      node.type === "em" ||
      node.type === "i" ||
      (typeof node.type === "string" && node.type.toLowerCase() === "em")
    ) {
      // Replace the em element with a span that has the green background but no italic style
      const props = node.props as { children?: React.ReactNode };
      return (
        <span className="bg-green-200 px-1 py-0.5 rounded not-italic">
          {props?.children}
        </span>
      );
    }

    // If it has children, process them recursively
    const props = node.props as { children?: React.ReactNode };
    if (props?.children) {
      const children = React.Children.toArray(props.children);
      const processedChildren = children.map((child) =>
        wrapItalicWithBackground(child)
      );
      return React.cloneElement(node as React.ReactElement<any>, {
        children: processedChildren,
      });
    }
  }

  // If it's an array, process each item
  if (Array.isArray(node)) {
    return node.map((item) => wrapItalicWithBackground(item));
  }

  return node;
}
import {
  getAllChapters,
  getChapterBySlug,
  getAdjacentChapters,
} from "@/lib/markdown";
import { getSectionsStructure } from "@/lib/sections";
import { ChapterLayout } from "@/components/ChapterLayout";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static paths for all chapters
export async function generateStaticParams() {
  const chapters = getAllChapters();
  return chapters.map((chapter) => ({
    slug: chapter.slug,
  }));
}

// Generate metadata for each chapter
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    return {
      title: "Chapter Not Found",
    };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://ocp-ai-buying.netlify.app";
  const chapterUrl = `${siteUrl}/chapter/${slug}`;

  // Extract description from chapter content (first paragraph or first 160 chars)
  let description = `Read ${chapter.title} - Buying AI guide by Open Contracting Partnership.`;
  const firstParagraph = chapter.content
    .split("\n\n")
    .find((p) => p.trim().length > 50 && !p.trim().startsWith("#"));
  if (firstParagraph) {
    description =
      firstParagraph.trim().replace(/\n/g, " ").substring(0, 160) + "...";
  }

  return {
    title: `${chapter.title} - Buying AI`,
    description,
    openGraph: {
      title: `${chapter.title} - Buying AI`,
      description,
      url: chapterUrl,
      siteName: "Open Contracting Partnership",
      images: [
        {
          url: "/images/og-image.png", // Ruta de la imagen OG - coloca tu imagen en public/og-image.png
          width: 1200,
          height: 630,
          alt: chapter.title,
        },
      ],
      locale: "en_US",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${chapter.title} - Buying AI`,
      description,
      images: ["/images/og-image.png"], // Ruta de la imagen OG - coloca tu imagen en public/og-image.png
    },
  };
}

// Process markdown to resolve image references
function processMarkdownImageReferences(content: string): string {
  // Map to store image references: refId -> imageUrl
  const imageRefs: Map<string, string> = new Map();

  // First pass: find all image reference definitions using multiline regex
  // Pattern matches: [ref]: <url> or [ref]: url
  // Using multiline flag to match start of lines
  const refPattern = /^\[([^\]]+)\]:\s*(.+)$/gm;
  let match;

  while ((match = refPattern.exec(content)) !== null) {
    const refId = match[1].toLowerCase().trim();
    let imageUrl = match[2].trim();

    // Remove angle brackets if present
    if (imageUrl.startsWith("<") && imageUrl.endsWith(">")) {
      imageUrl = imageUrl.slice(1, -1);
    }

    if (imageUrl) {
      imageRefs.set(refId, imageUrl);
    }
  }

  // Debug: log found references
  if (imageRefs.size > 0) {
    console.log(
      "[Image Processing] Found image references:",
      Array.from(imageRefs.keys())
    );
  } else {
    console.warn("[Image Processing] No image references found in content");
  }

  // Second pass: replace image references and remove definitions
  let processedContent = content;

  imageRefs.forEach((imageUrl, refId) => {
    // Escape special regex characters in refId
    const escapedRefId = refId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Match both ![alt][refId] and ![][refId] (case-insensitive)
    const imageRefPattern = new RegExp(
      `!\\[(.*?)\\]\\[${escapedRefId}\\]`,
      "gi"
    );

    const matches = processedContent.match(imageRefPattern);
    if (matches) {
      console.log(
        `[Image Processing] Replacing ${matches.length} image reference(s) for [${refId}]`
      );
    }

    processedContent = processedContent.replace(
      imageRefPattern,
      (match, altText) => {
        const replacement = `![${altText || ""}](${imageUrl})`;
        console.log(
          `[Image Processing] Replaced: "${match}" -> "${replacement.substring(
            0,
            100
          )}..."`
        );
        return replacement;
      }
    );

    // Remove the reference definition line
    const removePattern = new RegExp(`^\\[${escapedRefId}\\]:\\s*.+$`, "gim");
    processedContent = processedContent.replace(removePattern, "");
  });

  return processedContent;
}

// Custom remark plugin to fix images with data URIs that might have parsing issues
function remarkFixImageDataUris() {
  return (tree: Root) => {
    visit(tree, "image", (node: any) => {
      // Debug: log image nodes found
      if (process.env.NODE_ENV === "development") {
        console.log("[Remark Plugin] Image node found:", {
          urlLength: node.url?.length || 0,
          urlPreview: node.url?.substring(0, 50) || "none",
          alt: node.alt,
          hasUrl: !!node.url,
        });
      }

      // If URL is missing or empty, try to reconstruct it from the raw markdown
      // This handles cases where ReactMarkdown fails to parse long data URIs
      if (
        !node.url ||
        (typeof node.url === "string" && node.url.trim() === "")
      ) {
        console.warn(
          "[Remark Plugin] Image node has empty URL, attempting to fix:",
          {
            alt: node.alt,
            position: node.position,
          }
        );
        // The URL might be in the raw markdown source
        // We can't easily access it here, but we'll handle it in the component
      } else if (
        node.url &&
        typeof node.url === "string" &&
        node.url.startsWith("data:")
      ) {
        // Data URI is present, ensure it's preserved
        if (process.env.NODE_ENV === "development") {
          console.log("[Remark Plugin] Data URI image preserved:", {
            length: node.url.length,
          });
        }
        // Ensure the URL is properly set (this might help with parsing issues)
        node.url = node.url;
      }
    });
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { slug } = await params;
  const chapter = getChapterBySlug(slug);

  if (!chapter) {
    notFound();
  }

  const allChapters = getAllChapters().filter((ch) => ch.slug !== "00-toc");
  const { previous, next } = getAdjacentChapters(slug);
  const structure = getSectionsStructure();

  // First, process collapsible sections
  let processedContent = chapter.content;
  
  // Convert {.collapsible} syntax to custom markers
  // Match: **Title {.collapsible}**\n\nContent paragraph
  const collapsibleRegex = /\*\*(.*?)\s*\{\.collapsible\}\*\*\s*\n\n([^\n]+(?:\n(?!\n)[^\n]+)*)/g;
  processedContent = processedContent.replace(collapsibleRegex, (match, title, content) => {
    return `<CollapsibleSection title="${title.trim()}">\n\n${content}\n\n</CollapsibleSection>`;
  });
  
  // Process markdown to resolve image references
  processedContent = processMarkdownImageReferences(processedContent);

  // Split content by images to render them separately
  // This avoids ReactMarkdown parsing issues with long data URIs
  const imagePattern = /!\[([^\]]*)\]\((data:[^)]+)\)/g;
  const contentParts: Array<
    | { type: "markdown"; content: string }
    | { type: "image"; url: string; alt: string }
  > = [];
  let lastIndex = 0;
  let match;

  while ((match = imagePattern.exec(processedContent)) !== null) {
    // Add markdown content before the image
    if (match.index > lastIndex) {
      contentParts.push({
        type: "markdown",
        content: processedContent.substring(lastIndex, match.index),
      });
    }

    // Add the image
    contentParts.push({
      type: "image",
      url: match[2],
      alt: match[1] || "",
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining markdown content
  if (lastIndex < processedContent.length) {
    contentParts.push({
      type: "markdown",
      content: processedContent.substring(lastIndex),
    });
  }

  // If no images found, use original content
  if (contentParts.length === 0) {
    contentParts.push({
      type: "markdown",
      content: processedContent,
    });
  }

  // Debug: show processing results
  if (process.env.NODE_ENV === "development") {
    const hasImageRefs = chapter.content.includes("![][");
    console.log("[Content Processing]", {
      originalHasRefs: hasImageRefs,
      contentParts: contentParts.length,
      imagesFound: contentParts.filter((p) => p.type === "image").length,
    });
  }

  return (
    <ChapterLayout
      currentSlug={slug}
      allChapters={allChapters}
      chapterOrder={chapter.order}
      totalChapters={allChapters.length}
      structure={structure}
      chapterTitle={chapter.title}
    >
      <div className="max-w-3xl mx-auto">
        {/* Content Card */}
        <article className="bg-white rounded-lg shadow-sm p-12 mb-8">
          <div
            className="prose prose-slate max-w-none
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
                  // Render image directly
                  return (
                    <img
                      key={`image-${index}`}
                      src={part.url}
                      alt={part.alt || ""}
                      className="rounded-lg shadow-md max-w-full h-auto my-4"
                      loading="lazy"
                    />
                  );
                } else {
                  // Render markdown content
                  return (
                    <ReactMarkdown
                      key={`markdown-${index}`}
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={{
                          collapsiblesection: ({ title, children }: any) => (
                            <CollapsibleText title={title}>
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
                              className="rounded-lg shadow-md max-w-full h-auto"
                              loading="lazy"
                            />
                          );
                        },
                        h1: ({ children, className, ...props }: any) => {
                          const processedChildren =
                            wrapItalicWithBackground(children);
                          return (
                            <h1 {...props} className={className || ""}>
                              {processedChildren}
                            </h1>
                          );
                        },
                        h2: ({ children, className, ...props }: any) => {
                          const processedChildren =
                            wrapItalicWithBackground(children);
                          return (
                            <h2 {...props} className={className || ""}>
                              {processedChildren}
                            </h2>
                          );
                        },
                        h3: ({ children, className, ...props }: any) => {
                          const processedChildren =
                            wrapItalicWithBackground(children);
                          return (
                            <h3 {...props} className={className || ""}>
                              {processedChildren}
                            </h3>
                          );
                        },
                        h4: ({ children, className, ...props }: any) => {
                          const processedChildren =
                            wrapItalicWithBackground(children);
                          return (
                            <h4 {...props} className={className || ""}>
                              {processedChildren}
                            </h4>
                          );
                        },
                        h5: ({ children, className, ...props }: any) => {
                          const processedChildren =
                            wrapItalicWithBackground(children);
                          return (
                            <h5 {...props} className={className || ""}>
                              {processedChildren}
                            </h5>
                          );
                        },
                        h6: ({ children, className, ...props }: any) => {
                          const processedChildren =
                            wrapItalicWithBackground(children);
                          return (
                            <h6 {...props} className={className || ""}>
                              {processedChildren}
                            </h6>
                          );
                        },
                        pre: ({ children, ...props }: any) => {
                          // Get the text content from children
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
                            const endIndex = lines.findIndex((line, i) => i > 0 && line === "---");
                            if (endIndex > 0) {
                              // Extract frontmatter
                              const frontmatter = lines.slice(1, endIndex);
                              frontmatter.forEach(line => {
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
                              // Remove frontmatter from content
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

                          // Find title - ONLY if it's an actual heading (###)
                          let title = "";
                          let contentStartIndex = 0;
                          let hasHeading = false;
                          
                          for (let i = 0; i < lines.length; i++) {
                            const trimmedLine = lines[i].trim();
                            if (!trimmedLine) continue;
                            
                            // Check if it's a heading
                            const headingMatch = trimmedLine.match(/^#{1,6}\s+(.+)$/);
                            if (headingMatch) {
                              title = headingMatch[1];
                              contentStartIndex = i + 1;
                              hasHeading = true;
                              break;
                            }
                            
                            // If we find a non-heading, non-empty line first, no title
                            break;
                          }

                          // Render if we have an icon (frontmatter) OR if we have heading + bullets
                          if ((icon && lines.length > 0) || (hasHeading && hasBullets)) {
                            // If no heading was found, use all content as markdown
                            const content = hasHeading 
                              ? lines.slice(contentStartIndex).join("\n").trim()
                              : lines.join("\n").trim();
                            
                            // Determine background color
                            const bgColor = background === "grey" || background === "gray" 
                              ? "#E5E7EB" // gray-200
                              : "#F5F7E6"; // default green

                            return (
                              <div className="my-8 -mx-12 px-12 py-6 relative" style={{ backgroundColor: bgColor }}>
                                {icon && (
                                  <img
                                    src={`/icons/${icon}.png`}
                                    alt=""
                                    className="absolute top-6 left-12 w-12 h-12 !shadow-none"
                                  />
                                )}
                                <div className={`prose prose-sm max-w-none prose-headings:font-gteesti-display prose-headings:mb-4 prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-li:my-1 prose-li:text-gray-700 prose-li:leading-relaxed prose-p:my-2 prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-[#23B2A7] prose-a:no-underline hover:prose-a:underline ${icon ? 'ml-16' : ''}`}>
                                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {title ? `### ${title}\n\n${content}` : content}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            );
                          }

                          // Regular code block - hide it
                          return null;
                        },
                        code: ({ inline, children, ...props }: any) => {
                          // Only handle inline code here
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
                          // Block code is handled by pre component
                          return <code {...props}>{children}</code>;
                        },
                        table: ({ children, ...props }: any) => {
                          // Check if this is a header-only table by examining the children
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
                              // Check if tbody has any tr children
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
                            <table
                              className="w-full border-collapse border border-gray-300"
                              {...props}
                            >
                              {children}
                            </table>
                          );
                        },
                        thead: ({ children, ...props }: any) => {
                          return <thead {...props}>{children}</thead>;
                        },
                        th: ({ children, ...props }: any) => {
                          return (
                            <th
                              className="px-0 py-2 text-left font-semibold text-base text-gray-900 border-0"
                              {...props}
                            >
                              {children}
                            </th>
                          );
                        },
                        tr: ({ children, ...props }: any) => {
                          return (
                            <tr className="border-0" {...props}>
                              {children}
                            </tr>
                          );
                        },
                        td: ({ children, ...props }: any) => {
                          return (
                            <td
                              className="border border-gray-300 px-4 py-2 text-sm"
                              {...props}
                            >
                              {children}
                            </td>
                          );
                        },
                      } as any}
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
                components={{
                  collapsiblesection: ({ title, children }: any) => (
                    <CollapsibleText title={title}>
                      {children}
                    </CollapsibleText>
                  ),
                } as any}
              >
                {processedContent}
            </ReactMarkdown>
            )}
          </div>
        </article>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {previous && (
              <Link
                href={`/chapter/${previous.slug}#content`}
                scroll={false}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm">{previous.title}</span>
              </Link>
            )}
          </div>
          <div>
            {next && (
              <Link
                href={`/chapter/${next.slug}#content`}
                scroll={false}
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors group"
              >
                <span className="text-sm">{next.title}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </ChapterLayout>
  );
}

"use client";

import styled from "styled-components";

// Types for Tiptap JSON structure
interface TiptapMark {
  type: "bold" | "italic" | "underline" | "strike" | "link" | "code";
  attrs?: { href?: string; target?: string };
}

interface TiptapNode {
  type: string;
  content?: TiptapNode[];
  text?: string;
  marks?: TiptapMark[];
  attrs?: Record<string, unknown>;
}

interface TiptapContent {
  type: "doc";
  content?: TiptapNode[];
}

interface TiptapViewerProps {
  content: TiptapContent | string | null | unknown;
  className?: string;
}

// Styled container with prose-like styling
const ViewerContainer = styled.div`
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.text.secondary};

  h1 {
    font-size: 1.75rem;
    font-weight: 700;
    margin: 1.5rem 0 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 1.25rem 0 0.75rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 1rem 0 0.5rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0.75rem 0;
  }

  ul,
  ol {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin: 0.25rem 0;
  }

  blockquote {
    border-left: 3px solid ${({ theme }) => theme.colors.primary.main};
    padding-left: 1rem;
    margin: 1rem 0;
    font-style: italic;
    color: ${({ theme }) => theme.colors.text.muted};
  }

  code {
    background: ${({ theme }) => theme.colors.gray[100]};
    padding: 0.125rem 0.25rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.875em;
  }

  a {
    color: ${({ theme }) => theme.colors.primary.main};
    text-decoration: underline;
  }

  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
    margin: 1.5rem 0;
  }
`;

// Render marks (bold, italic, etc.) around text
function renderMarks(text: string, marks?: TiptapMark[]): React.ReactNode {
  if (!marks || marks.length === 0) return text;

  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>;
      case "italic":
        return <em>{acc}</em>;
      case "underline":
        return <u>{acc}</u>;
      case "strike":
        return <s>{acc}</s>;
      case "code":
        return <code>{acc}</code>;
      case "link":
        return (
          <a href={mark.attrs?.href} target="_blank" rel="noopener noreferrer">
            {acc}
          </a>
        );
      default:
        return acc;
    }
  }, text);
}

// Render a single node
function renderNode(node: TiptapNode, index: number): React.ReactNode {
  const key = `${node.type}-${index}`;

  // Text node
  if (node.type === "text" && node.text) {
    return <span key={key}>{renderMarks(node.text, node.marks)}</span>;
  }

  // Recursive children rendering
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "paragraph":
      return <p key={key}>{children}</p>;
    case "heading": {
      const level = (node.attrs?.level as number) || 1;
      if (level === 1) return <h1 key={key}>{children}</h1>;
      if (level === 2) return <h2 key={key}>{children}</h2>;
      return <h3 key={key}>{children}</h3>;
    }
    case "bulletList":
      return <ul key={key}>{children}</ul>;
    case "orderedList":
      return <ol key={key}>{children}</ol>;
    case "listItem":
      return <li key={key}>{children}</li>;
    case "blockquote":
      return <blockquote key={key}>{children}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{children}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    default:
      // Unknown node type, render children if any
      return children ? <div key={key}>{children}</div> : null;
  }
}

// Parse content to TiptapContent
function parseContent(content: unknown): TiptapContent | null {
  if (!content) return null;

  // Already TiptapContent
  if (typeof content === "object" && (content as TiptapContent).type === "doc") {
    return content as TiptapContent;
  }

  // Plain string - wrap in paragraph
  if (typeof content === "string") {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      if (parsed.type === "doc") return parsed;
    } catch {
      // Not JSON, treat as plain text
    }
    return {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: content }] }],
    };
  }

  return null;
}

export default function TiptapViewer({ content, className = "" }: TiptapViewerProps) {
  const parsedContent = parseContent(content);

  if (!parsedContent || !parsedContent.content || parsedContent.content.length === 0) {
    return null;
  }

  return (
    <ViewerContainer className={className}>
      {parsedContent.content.map((node, index) => renderNode(node, index))}
    </ViewerContainer>
  );
}

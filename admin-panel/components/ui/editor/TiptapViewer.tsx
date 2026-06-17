"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import type { TiptapContent } from "./TiptapEditor";

interface TiptapViewerProps {
  content: TiptapContent | string | null;
  className?: string;
}

export function TiptapViewer({ content, className = "" }: TiptapViewerProps) {
  // Convert string content to TiptapContent if needed
  const initialContent =
    typeof content === "string"
      ? {
          type: "doc" as const,
          content: [
            { type: "paragraph", content: [{ type: "text", text: content }] },
          ],
        }
      : content || { type: "doc" as const, content: [] };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Underline,
    ],
    content: initialContent,
    editable: false,
    immediatelyRender: false,
  });

  if (!editor) {
    return (
      <div className={`animate-pulse bg-neutral-100 rounded h-20 ${className}`} />
    );
  }

  return (
    <div className={`tiptap-viewer prose prose-sm max-w-none ${className}`}>
      <EditorContent editor={editor} />
    </div>
  );
}

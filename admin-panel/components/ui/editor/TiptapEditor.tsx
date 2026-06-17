"use client";

import { useEditor, EditorContent, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useCallback, useState } from "react";
import { TiptapToolbar } from "./TiptapToolbar";
import { LinkModal } from "./LinkModal";

export interface TiptapContent {
  type: "doc";
  content: JSONContent[];
}

interface TiptapEditorProps {
  content: TiptapContent | string;
  onChange: (content: TiptapContent) => void;
  placeholder?: string;
  editable?: boolean;
  minHeight?: string;
}

export function TiptapEditor({
  content,
  onChange,
  placeholder = "Commencez a ecrire votre description...",
  editable = true,
  minHeight = "200px",
}: TiptapEditorProps) {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Convert string content to TiptapContent if needed
  const initialContent =
    typeof content === "string"
      ? { type: "doc" as const, content: [{ type: "paragraph", content: [{ type: "text", text: content }] }] }
      : content;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: { keepMarks: true },
        orderedList: { keepMarks: true },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline" },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TiptapContent);
    },
    editorProps: {
      attributes: {
        class: `tiptap-editor focus:outline-none px-4 py-3`,
        style: `min-height: ${minHeight}`,
      },
    },
    immediatelyRender: false,
  });

  // Sync external content changes
  useEffect(() => {
    if (
      editor &&
      typeof content !== "string" &&
      content?.type === "doc" &&
      JSON.stringify(editor.getJSON()) !== JSON.stringify(content)
    ) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleSetLink = useCallback(
    (url: string) => {
      if (!editor) return;
      if (url) {
        editor
          .chain()
          .focus()
          .extendMarkRange("link")
          .setLink({ href: url })
          .run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
      setIsLinkModalOpen(false);
    },
    [editor]
  );

  if (!editor) {
    return (
      <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
        <div className="bg-neutral-50 border-b border-neutral-200 px-2 py-1.5 h-[42px]" />
        <div style={{ minHeight }} className="px-4 py-3 animate-pulse bg-neutral-50" />
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white">
      <TiptapToolbar
        editor={editor}
        onLinkClick={() => setIsLinkModalOpen(true)}
      />
      <EditorContent editor={editor} />
      <LinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        onSubmit={handleSetLink}
        currentUrl={editor.getAttributes("link").href || ""}
      />
    </div>
  );
}

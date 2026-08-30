"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Undo2, Redo2 } from "lucide-react";
import { cn } from "@/lib/utils";

function Btn({
  on,
  active,
  children,
  label,
}: {
  on: () => void;
  active?: boolean;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={on}
      className={cn(
        "grid size-8 place-items-center rounded text-muted-foreground transition hover:bg-secondary hover:text-foreground",
        active && "bg-secondary text-foreground",
      )}
    >
      {children}
    </button>
  );
}

/** TipTap editor. Emits HTML via onChange; store the string on the record. */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Write…",
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [StarterKit],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose-admin min-h-40 max-w-none px-3 py-2.5 text-sm outline-none [&_h2]:font-heading [&_h2]:text-lg [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep external resets in sync (e.g. after save/reset).
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) {
    return <div className="min-h-40 rounded-md border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground">{placeholder}</div>;
  }

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border p-1">
        <Btn label="Bold" on={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
          <Bold className="size-4" />
        </Btn>
        <Btn label="Italic" on={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
          <Italic className="size-4" />
        </Btn>
        <Btn
          label="Heading"
          on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="size-4" />
        </Btn>
        <Btn label="Bulleted list" on={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
          <List className="size-4" />
        </Btn>
        <Btn label="Numbered list" on={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
          <ListOrdered className="size-4" />
        </Btn>
        <Btn label="Quote" on={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
          <Quote className="size-4" />
        </Btn>
        <span className="mx-1 h-5 w-px bg-border" />
        <Btn label="Undo" on={() => editor.chain().focus().undo().run()}>
          <Undo2 className="size-4" />
        </Btn>
        <Btn label="Redo" on={() => editor.chain().focus().redo().run()}>
          <Redo2 className="size-4" />
        </Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

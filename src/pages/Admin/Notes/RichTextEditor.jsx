import { useState } from "react";
import { toast } from "sonner";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Heading2, Heading3, List, ListOrdered, Link2 } from "lucide-react";
import "./RichTextEditor.css";

const EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    strike: false,
    code: false,
    codeBlock: false,
    blockquote: false,
    horizontalRule: false,
    underline: false,
    trailingNode: false,
    link: {
      openOnClick: false,
      autolink: true,
      linkOnPaste: true,
      defaultProtocol: "https",
      HTMLAttributes: { target: "_blank", rel: "noopener noreferrer nofollow" },
    },
  }),
];

const ALLOWED_LINK = /^(https?:\/\/|mailto:|tel:)/i;

const normalizeLink = (value) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return ALLOWED_LINK.test(withScheme) ? withScheme : null;
};

const ToolbarButton = ({ label, active, onClick, children }) => (
  <button
    type="button"
    title={label}
    aria-label={label}
    aria-pressed={active}
    onMouseDown={(event) => event.preventDefault()}
    onClick={onClick}
    className={`flex justify-center items-center w-8 h-8 rounded-md ${
      active ? "bg-theme-color-1 text-white" : "text-gray-600 hover:bg-gray-100"
    }`}
  >
    {children}
  </button>
);

const Toolbar = ({ editor }) => {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");

  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current.isActive("bold"),
      italic: current.isActive("italic"),
      h2: current.isActive("heading", { level: 2 }),
      h3: current.isActive("heading", { level: 3 }),
      bullet: current.isActive("bulletList"),
      ordered: current.isActive("orderedList"),
      link: current.isActive("link"),
    }),
  });

  const openLink = () => {
    setLinkValue(editor.getAttributes("link").href || "");
    setLinkOpen(true);
  };

  const closeLink = () => {
    setLinkOpen(false);
    editor.chain().focus().run();
  };

  const applyLink = () => {
    const href = normalizeLink(linkValue);
    if (href === null) {
      toast.error("Use a web address (https://...), an email (mailto:...) or a phone number (tel:...).");
      return;
    }
    if (href === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else if (editor.state.selection.empty && !editor.isActive("link")) {
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href } }] })
        .run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  const removeLink = () => {
    editor.chain().focus().extendMarkRange("link").unsetLink().run();
    setLinkOpen(false);
  };

  return (
    <div className="border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <div className="flex flex-wrap gap-1 items-center p-1.5">
        <ToolbarButton label="Bold" active={active?.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton label="Italic" active={active?.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <span className="mx-1 w-px h-5 bg-gray-300" />
        <ToolbarButton label="Heading" active={active?.h2} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton label="Subheading" active={active?.h3} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>
        <span className="mx-1 w-px h-5 bg-gray-300" />
        <ToolbarButton label="Bullet list" active={active?.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton label="Numbered list" active={active?.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <span className="mx-1 w-px h-5 bg-gray-300" />
        <ToolbarButton label="Link" active={active?.link} onClick={linkOpen ? closeLink : openLink}>
          <Link2 className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {linkOpen && (
        <div className="flex flex-wrap gap-2 items-center px-2 pb-2">
          <input
            autoFocus
            value={linkValue}
            onChange={(event) => setLinkValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                applyLink();
              }
              if (event.key === "Escape") closeLink();
            }}
            placeholder="https://example.com"
            className="flex-1 px-3 py-1.5 min-w-[12rem] text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1"
          />
          <button type="button" onClick={applyLink} className="px-3 py-1.5 text-sm font-semibold text-white rounded-lg bg-theme-color-1 hover:bg-black">
            Apply
          </button>
          {active?.link && (
            <button type="button" onClick={removeLink} className="px-3 py-1.5 text-sm font-semibold text-red-600 rounded-lg border border-red-200 hover:bg-red-50">
              Remove link
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const RichTextEditor = ({ initialHtml, onChange }) => {
  const editor = useEditor({
    extensions: EXTENSIONS,
    content: initialHtml || "",
    editorProps: { attributes: { class: "note-editor-content", "aria-label": "Details" } },
    onUpdate: ({ editor: current }) => onChange(current.isEmpty ? "" : current.getHTML()),
  });

  if (!editor) return <div className="h-48 bg-gray-50 rounded-lg border border-gray-300" />;

  return (
    <div className="bg-white rounded-lg border border-gray-300 focus-within:ring-2 focus-within:ring-theme-color-1">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;

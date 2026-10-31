import { useState } from "react";
import { MoreVertical, Pencil, Trash2, Clock, Paperclip, User } from "lucide-react";
import {
  getCategoryIcon,
  withAlpha,
  UNCATEGORISED_COLOR,
  PRIORITY_LABELS,
  PRIORITY_CHIP_STYLES,
  formatNoteDateTime,
  formatDueLabel,
  isOverdue,
} from "./noteDisplay";

export const NoteCard = ({ note, category, onToggleDone, onEdit, onDelete }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const color = category?.color || UNCATEGORISED_COLOR;
  const Icon = getCategoryIcon(category?.icon);
  const overdue = isOverdue(note);

  return (
    <div
      className={`flex gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm ${note.isDone ? "opacity-70" : ""}`}
    >
      <input
        type="checkbox"
        checked={note.isDone}
        onChange={(e) => onToggleDone(note, e.target.checked)}
        className="flex-shrink-0 mt-1 w-4 h-4 rounded border-gray-300 cursor-pointer accent-theme-color-1"
        aria-label={`Mark "${note.title}" as done`}
      />

      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onEdit(note)}>
        <span
          className="inline-flex gap-1.5 items-center px-2.5 py-1 text-xs font-semibold rounded-md"
          style={{ backgroundColor: withAlpha(color, "1f"), color }}
        >
          <Icon className="w-3.5 h-3.5" />
          {note.category || "Uncategorised"}
        </span>
        <p className={`mt-2 font-semibold break-words ${note.isDone ? "text-gray-500 line-through" : "text-gray-900"}`}>
          {note.title}
        </p>
        {note.body && <p className="text-sm text-gray-500 truncate">{note.body}</p>}

        <div className="flex flex-wrap gap-x-4 gap-y-1 items-center mt-2 text-xs text-gray-500">
          {note.dueAt && (
            <span className={`inline-flex gap-1 items-center ${overdue ? "font-semibold text-red-600" : ""}`}>
              <Clock className="w-3.5 h-3.5" />
              {overdue ? "Overdue" : "Due"} {formatDueLabel(note.dueAt)}
            </span>
          )}
          {note.customer && (
            <span className="inline-flex gap-1 items-center">
              <User className="w-3.5 h-3.5" />
              {note.customer.name}
            </span>
          )}
          {note.attachments?.length > 0 && (
            <span className="inline-flex gap-1 items-center">
              <Paperclip className="w-3.5 h-3.5" />
              {note.attachments.length}
            </span>
          )}
          {note.createdBy?.name && <span>by {note.createdBy.name}</span>}
        </div>
      </div>

      <div className="flex flex-col flex-shrink-0 gap-2 items-end">
        <div className="flex gap-1 items-center">
          <span className="text-xs text-right text-gray-500">{formatNoteDateTime(note.createdAt)}</span>
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="p-1 text-gray-400 rounded-md hover:text-gray-700 hover:bg-gray-100"
              aria-label="Note actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 z-20 mt-1 w-32 bg-white rounded-lg border border-gray-200 shadow-lg">
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onEdit(note); }}
                    className="flex gap-2 items-center px-3 py-2 w-full text-sm text-left hover:bg-gray-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMenuOpen(false); onDelete(note); }}
                    className="flex gap-2 items-center px-3 py-2 w-full text-sm text-left text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${PRIORITY_CHIP_STYLES[note.priority]}`}>
          {PRIORITY_LABELS[note.priority]}
        </span>
      </div>
    </div>
  );
};

export default NoteCard;

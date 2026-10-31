import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Plus, Search, X } from "lucide-react";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import Pagination from "../../../components/common/Pagination/Pagination";
import { deleteFileFromS3 } from "../../../utils/s3Files";
import { useNoteCategories, useNotesList, useNotesOverview, useNoteActions } from "./useNotes";
import { CategoryPanel } from "./CategoryPanel";
import { NoteCard } from "./NoteCard";
import { NoteFormPopup } from "./NoteFormPopup";
import { CategoryFormPopup } from "./CategoryFormPopup";
import { SummaryCard, UpcomingCard, RecentActivityCard } from "./NotesSidePanels";
import { SORT_OPTIONS, STATUS_OPTIONS } from "./noteDisplay";

const EMPTY_OVERVIEW = {
  totalNotes: 0,
  countsByCategory: {},
  today: { total: 0, high: 0, medium: 0, low: 0 },
  upcoming: [],
  activity: [],
};

const selectClass =
  "px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const useDebouncedValue = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

export const Notes = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [quick, setQuick] = useState("");
  const [sort, setSort] = useState("latest");
  const [status, setStatus] = useState("all");
  const [pending, setPending] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(6);
  const [noteForm, setNoteForm] = useState(null);
  const [categoryForm, setCategoryForm] = useState(null);

  const debouncedSearch = useDebouncedValue(search, 300);

  const { categories, addCategory, editCategory, removeCategory } = useNoteCategories();
  const overviewQuery = useNotesOverview(quick);
  const listQuery = useNotesList({
    search: debouncedSearch,
    category: activeCategory,
    quick,
    sort,
    status: status === "all" ? "" : status,
    pending: pending ? "1" : "",
    page,
    limit: rowsPerPage,
  });
  const { createNote, updateNote, setNoteDone, deleteNote } = useNoteActions();

  const overview = overviewQuery.data || EMPTY_OVERVIEW;
  const notes = listQuery.data?.notes || [];
  const total = listQuery.data?.total || 0;
  const categoryByName = new Map(categories.map((category) => [category.name, category]));

  useEffect(() => {
    if (listQuery.data && listQuery.data.notes.length === 0 && listQuery.data.total > 0 && page > 1) {
      setPage(Math.max(1, Math.ceil(listQuery.data.total / rowsPerPage)));
    }
  }, [listQuery.data, page, rowsPerPage]);

  const changeFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  const showPendingTasks = () => {
    setPending(true);
    setActiveCategory("");
    setQuick("");
    setStatus("all");
    setSearch("");
    setPage(1);
  };

  const handleToggleDone = async (note, isDone) => {
    try {
      await setNoteDone(note._id, isDone);
    } catch (err) {
      console.error("Error updating note status:", err);
      toast.error(err.response?.data?.message || "Failed to update the note.");
    }
  };

  const handleSaveNote = async (payload) => {
    if (noteForm.note) {
      await updateNote(noteForm.note._id, payload);
      toast.success("Note updated.");
    } else {
      await createNote(payload);
      toast.success("Note added.");
    }
    setNoteForm(null);
  };

  const handleDeleteNote = async (note) => {
    if (!window.confirm(`Delete "${note.title}"? This can't be undone.`)) return;
    try {
      const result = await deleteNote(note._id);
      (result.attachments || []).forEach((attachment) => deleteFileFromS3(attachment.url));
      toast.success("Note deleted.");
    } catch (err) {
      console.error("Error deleting note:", err);
      toast.error(err.response?.data?.message || "Failed to delete the note.");
    }
  };

  const handleSaveCategory = async (payload) => {
    if (categoryForm.category) {
      const previousName = categoryForm.category.name;
      await editCategory(categoryForm.category._id, payload);
      if (activeCategory === previousName) setActiveCategory(payload.name);
      toast.success("Category updated.");
    } else {
      await addCategory(payload);
      toast.success("Category added.");
    }
    setCategoryForm(null);
  };

  const handleDeleteCategory = async (category) => {
    await removeCategory(category._id);
    if (activeCategory === category.name) setActiveCategory("");
    setCategoryForm(null);
    toast.success("Category deleted.");
  };

  const hasActiveFilters = Boolean(debouncedSearch || activeCategory || quick || status !== "all");

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-6 w-full max-w-7xl">
          <div className="flex flex-wrap gap-3 justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notes &amp; Tasks</h2>
              <p className="text-sm text-gray-500">Keep track of important notes, daily tasks and admin updates.</p>
            </div>
            <button
              type="button"
              onClick={() => setNoteForm({ note: null })}
              className="flex gap-2 items-center px-5 py-3 text-sm font-semibold text-white rounded-xl bg-theme-color-1 hover:bg-black"
            >
              <Plus className="w-4 h-4" />
              Add New Note
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[15rem_minmax(0,1fr)_19rem]">
            <CategoryPanel
              categories={categories}
              countsByCategory={overview.countsByCategory}
              totalNotes={overview.totalNotes}
              activeCategory={activeCategory}
              onSelectCategory={(name) => { changeFilter(setActiveCategory)(name); setPending(false); }}
              onAddCategory={() => setCategoryForm({ category: null })}
              onEditCategory={(category) => setCategoryForm({ category })}
              quick={quick}
              onSelectQuick={(key) => { changeFilter(setQuick)(key); setPending(false); }}
            />

            <div className="space-y-4 min-w-0">
              <div className="flex flex-wrap gap-3 items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 min-w-[12rem]">
                  <Search className="absolute left-3 top-1/2 w-4 h-4 text-gray-400 -translate-y-1/2" />
                  <input
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    placeholder="Search notes..."
                    className="py-2 pr-3 pl-9 w-full text-sm text-gray-700 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-theme-color-1"
                  />
                </div>
                <select
                  className={selectClass}
                  value={status}
                  onChange={(e) => { changeFilter(setStatus)(e.target.value); setPending(false); }}
                  aria-label="Filter by status"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={sort}
                  disabled={pending}
                  onChange={(e) => changeFilter(setSort)(e.target.value)}
                  aria-label="Sort notes"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {pending && (
                <div className="flex gap-3 justify-between items-center px-4 py-2.5 text-sm text-amber-800 bg-amber-50 rounded-xl border border-amber-200">
                  <span>Showing open tasks with a due date, soonest first.</span>
                  <button
                    type="button"
                    onClick={() => changeFilter(setPending)(false)}
                    className="flex gap-1 items-center font-semibold hover:underline"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {listQuery.isLoading ? (
                  <p className="py-10 text-sm text-center text-gray-500">Loading notes...</p>
                ) : listQuery.isError ? (
                  <p className="py-10 text-sm text-center text-red-500">Could not load notes. Please try again.</p>
                ) : notes.length === 0 ? (
                  <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500">
                      {hasActiveFilters || pending ? "No notes match these filters." : "No notes yet — add your first one."}
                    </p>
                  </div>
                ) : (
                  notes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      category={categoryByName.get(note.category)}
                      onToggleDone={handleToggleDone}
                      onEdit={(selected) => setNoteForm({ note: selected })}
                      onDelete={handleDeleteNote}
                    />
                  ))
                )}
              </div>

              {total > 0 && (
                <div className="overflow-hidden bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Pagination
                    totalItems={total}
                    currentPage={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={setPage}
                    onRowsChange={setRowsPerPage}
                    rowsOptions={[6, 12, 24]}
                  />
                </div>
              )}
            </div>

            <div className="space-y-6 lg:col-span-2 xl:col-span-1">
              <SummaryCard today={overview.today} />
              <UpcomingCard
                items={overview.upcoming}
                onViewAll={showPendingTasks}
                onComplete={(item) => handleToggleDone(item, true)}
              />
              <RecentActivityCard activity={overview.activity} />
            </div>
          </div>
        </div>
      </div>

      {noteForm && (
        <NoteFormPopup
          key={noteForm.note?._id || "new"}
          note={noteForm.note}
          categories={categories}
          onClose={() => setNoteForm(null)}
          onSave={handleSaveNote}
        />
      )}

      {categoryForm && (
        <CategoryFormPopup
          key={categoryForm.category?._id || "new"}
          category={categoryForm.category}
          onClose={() => setCategoryForm(null)}
          onSave={handleSaveCategory}
          onDelete={handleDeleteCategory}
        />
      )}
    </DashboardLayoutComponent>
  );
};

export default Notes;

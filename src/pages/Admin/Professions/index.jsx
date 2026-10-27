import { toast } from "sonner";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { OptionListEditor } from "../../../components/common/OptionListEditor/OptionListEditor";
import { useProfessionOptions } from "../../../useProfessionOptions";

export const Professions = () => {
  const { professionOptions, isLoading, addOption, editOption, removeOption } = useProfessionOptions();

  const handleDelete = async (option) => {
    if (!window.confirm(`Delete "${option.label}"? Customers who already chose it keep it on their profile — it just stops being offered to new choices.`)) {
      return;
    }
    try {
      await removeOption(option._id);
      toast.success("Profession deleted.");
    } catch (err) {
      console.error("Error deleting profession:", err);
      toast.error(err.response?.data?.message || "Failed to delete profession.");
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-8 w-full max-w-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Professions</h2>
            <p className="text-sm text-gray-500">
              The profession choices customers see on the signup form and their Profile page. Renaming one also updates every customer who already chose it.
            </p>
          </div>

          <OptionListEditor
            title="Profession List"
            description="Customers pick one."
            placeholder="Profession (e.g. Teacher)"
            maxLength={40}
            options={professionOptions}
            isLoading={isLoading}
            footnote={'"Other" is always shown at the end of the list. Customers who pick it type their own profession.'}
            onAdd={addOption}
            onRename={editOption}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default Professions;

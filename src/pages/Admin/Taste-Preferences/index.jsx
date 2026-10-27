import { toast } from "sonner";
import DashboardLayoutComponent from "../../../components/common/Dashboard/Dashboard";
import { OptionListEditor } from "../../../components/common/OptionListEditor/OptionListEditor";
import { useTasteOptions } from "../../../useTasteOptions";

export const TastePreferences = () => {
  const { spiceOptions, flavourOptions, isLoading, addOption, editOption, removeOption } = useTasteOptions();

  const handleDelete = async (option) => {
    if (!window.confirm(`Delete "${option.label}"? Customers who already chose it keep it on their plan — it just stops being offered to new choices.`)) {
      return;
    }
    try {
      await removeOption(option._id);
      toast.success("Option deleted.");
    } catch (err) {
      console.error("Error deleting taste option:", err);
      toast.error(err.response?.data?.message || "Failed to delete option.");
    }
  };

  return (
    <DashboardLayoutComponent>
      <div className="p-4 w-full text-left sm:p-6 md:p-8">
        <div className="mx-auto space-y-8 w-full max-w-3xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Taste Preferences</h2>
            <p className="text-sm text-gray-500">
              The choices customers see when they buy a plan or edit it in My Plans. Renaming an option also updates every plan that already uses it.
            </p>
          </div>

          <OptionListEditor
            title="Spice Level"
            description="Customers pick one."
            placeholder="Option name (e.g. Medium)"
            options={spiceOptions}
            isLoading={isLoading}
            onAdd={(label) => addOption("spice", label)}
            onRename={editOption}
            onDelete={handleDelete}
          />

          <OptionListEditor
            title="Flavour Preferences"
            description="Customers can pick as many as they like."
            placeholder="Option name (e.g. Grilled)"
            options={flavourOptions}
            isLoading={isLoading}
            onAdd={(label) => addOption("flavour", label)}
            onRename={editOption}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default TastePreferences;

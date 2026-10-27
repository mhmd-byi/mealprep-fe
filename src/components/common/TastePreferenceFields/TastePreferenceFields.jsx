import { useTasteOptions } from "../../../useTasteOptions";

const DEFAULT_SELECT_CLASS =
  "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";

const DEFAULT_LABEL_CLASS = "block mb-1 text-xs font-medium text-gray-500";

const defaultRenderLabel = (text) => <label className={DEFAULT_LABEL_CLASS}>{text}</label>;

export const TastePreferenceFields = ({
  spiceLevel = "",
  flavourPreferences = [],
  onChange,
  selectClass = DEFAULT_SELECT_CLASS,
  renderLabel = defaultRenderLabel,
  disabled = false,
}) => {
  const { spiceOptions, flavourOptions } = useTasteOptions();

  const toggleFlavour = (label) => {
    const next = flavourPreferences.includes(label)
      ? flavourPreferences.filter((item) => item !== label)
      : [...flavourPreferences, label];
    onChange({ spiceLevel, flavourPreferences: next });
  };

  return (
    <>
      {spiceOptions.length > 0 && (
        <div>
          {renderLabel("Spice Level (optional)", "How spicy the customer likes their food. It shows in the Meal Delivery List.")}
          <select
            className={selectClass}
            value={spiceLevel}
            disabled={disabled}
            onChange={(e) => onChange({ spiceLevel: e.target.value, flavourPreferences })}
          >
            <option value="">No preference</option>
            {spiceOptions.map((option) => (
              <option key={option._id} value={option.label}>{option.label}</option>
            ))}
          </select>
        </div>
      )}
      {flavourOptions.length > 0 && (
        <div>
          {renderLabel("Flavour Preferences (optional)", "Cuisines and styles the customer enjoys. Pick any that apply.")}
          <div className="flex flex-wrap gap-2">
            {flavourOptions.map((option) => {
              const isSelected = flavourPreferences.includes(option.label);
              return (
                <button
                  key={option._id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleFlavour(option.label)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border disabled:opacity-60 ${
                    isSelected
                      ? "bg-theme-color-1 text-white border-theme-color-1"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default TastePreferenceFields;

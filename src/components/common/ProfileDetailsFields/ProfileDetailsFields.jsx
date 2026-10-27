import { Input } from "../../shared";
import { useProfessionOptions } from "../../../useProfessionOptions";
import { GENDER_OPTIONS, OTHER_PROFESSION } from "../../../profileFields";

const LABEL_CLASS = "block mb-1 text-sm font-medium text-gray-700";

export const ProfileDetailsFields = ({
  gender = "",
  genderOther = "",
  profession = "",
  professionOther = "",
  onChange,
  showLabels = false,
  disabled = false,
}) => {
  const { professionOptions } = useProfessionOptions();

  const isStoredButRemoved =
    profession && profession !== OTHER_PROFESSION && !professionOptions.some((option) => option.label === profession);

  const professionChoices = [
    ...professionOptions.map((option) => ({ value: option.label, label: option.label })),
    ...(isStoredButRemoved ? [{ value: profession, label: profession }] : []),
    { value: OTHER_PROFESSION, label: OTHER_PROFESSION },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <div className="space-y-2">
        <div>
          {showLabels && <label className={LABEL_CLASS}>Gender</label>}
          <Input
            type="select"
            id="gender"
            name="gender"
            value={gender}
            disabled={disabled}
            placeholder={showLabels ? "Select gender" : "Gender (optional)"}
            options={GENDER_OPTIONS}
            onChange={(e) =>
              onChange({ gender: e.target.value, genderOther: e.target.value === "other" ? genderOther : "" })
            }
          />
        </div>
        {gender === "other" && (
          <Input
            type="text"
            id="genderOther"
            name="genderOther"
            required
            maxLength={40}
            value={genderOther}
            disabled={disabled}
            placeholder="Please type your gender"
            onChange={(e) => onChange({ genderOther: e.target.value })}
          />
        )}
      </div>

      <div className="space-y-2">
        <div>
          {showLabels && <label className={LABEL_CLASS}>Profession</label>}
          <Input
            type="select"
            id="profession"
            name="profession"
            value={profession}
            disabled={disabled}
            placeholder={showLabels ? "Select profession" : "Profession (optional)"}
            options={professionChoices}
            onChange={(e) =>
              onChange({
                profession: e.target.value,
                professionOther: e.target.value === OTHER_PROFESSION ? professionOther : "",
              })
            }
          />
        </div>
        {profession === OTHER_PROFESSION && (
          <Input
            type="text"
            id="professionOther"
            name="professionOther"
            required
            maxLength={60}
            value={professionOther}
            disabled={disabled}
            placeholder="Please type your profession"
            onChange={(e) => onChange({ professionOther: e.target.value })}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileDetailsFields;

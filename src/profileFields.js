export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export const OTHER_PROFESSION = "Other";

export const pickProfileFields = (user) => ({
  gender: user?.gender || "",
  genderOther: user?.genderOther || "",
  profession: user?.profession || "",
  professionOther: user?.professionOther || "",
});

export const formatGender = (user) => {
  if (user?.gender === "other") return user.genderOther ? `Other – ${user.genderOther}` : "Other";
  return GENDER_OPTIONS.find((option) => option.value === user?.gender)?.label || "";
};

export const formatProfession = (user) => {
  if (user?.profession === OTHER_PROFESSION) {
    return user.professionOther ? `Other – ${user.professionOther}` : "Other";
  }
  return user?.profession || "";
};

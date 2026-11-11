import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { pickProfileFields } from "../../profileFields";
import { failureText, uploadProfilePhoto } from "../../utils/imageUpload";

const useProfile = (setUserDetails, userDetails) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    email: "",
    postalAddress: "",
    profileImageUrl: "",
  });

  const token = sessionStorage.getItem("token");
  const userId = sessionStorage.getItem("userId");
  const [profileDraft, setProfileDraft] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const logProfileActivity = async (description) => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}activity/add-activity`, {
        userId,
        date: new Date().toISOString().split("T")[0],
        description,
        category: "profile",
      });
    } catch (err) {
      console.error("Error logging profile activity:", err);
    }
  };

  const handleFileChange = (event) => {
    const fileToUpload = event.target.files[0];
    setFile(fileToUpload);
  };

  const handlePopupSubmit = async () => {
    if (!file) {
      toast.error("Please choose a file first!");
      return;
    }
    setIsLoading(true);
    try {
      const newImageUrl = await uploadProfilePhoto(userId, file);
      setUserDetails((prevDetails) => ({
        ...prevDetails,
        profileImageUrl: newImageUrl,
      }));
      setShowPopup(false);
      toast.success("Profile photo updated successfully.");
    } catch (error) {
      console.error("Error updating profile photo:", error);
      toast.error(failureText(error, "Failed to update profile photo."));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
  };

  const CHANGED_FIELD_LABELS = {
    firstName: "First Name",
    lastName: "Last Name",
    mobile: "Mobile Number",
    password: "Password",
    postalAddress: "Postal Address",
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedFormData = { ...formData };
    if (updatedFormData.password === updatedFormData.confirmPassword) {
      try {
        const response = await axios({
          method: "PATCH",
          url: `${process.env.REACT_APP_API_URL}user/${userId}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: { ...updatedFormData, ...(profileDraft || {}) },
        });
        // Not response.data — that's the raw server document, and its
        // `password` is the bcrypt hash, not something to show back in a
        // password field. Clear the form instead; userDetails (below) is
        // the canonical source the inputs fall back to display.
        setFormData({
          firstName: "",
          lastName: "",
          mobile: "",
          password: "",
          confirmPassword: "",
          email: "",
          postalAddress: "",
          profileImageUrl: "",
        });
        setUserDetails((prev) => ({
          ...prev,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          postalAddress: response.data.postalAddress,
          ...pickProfileFields(response.data),
        }));
        toast.success("Profile updated successfully.");

        const labels = Object.keys(CHANGED_FIELD_LABELS)
          .filter((key) => formData[key])
          .map((key) => CHANGED_FIELD_LABELS[key]);
        if (profileDraft) {
          const saved = pickProfileFields(userDetails);
          if (profileDraft.gender !== saved.gender || profileDraft.genderOther !== saved.genderOther) labels.push("Gender");
          if (profileDraft.profession !== saved.profession || profileDraft.professionOther !== saved.professionOther) labels.push("Profession");
        }
        setProfileDraft(null);
        if (labels.length > 0) {
          logProfileActivity(`Updated profile: ${labels.join(", ")}`);
        }
      } catch (error) {
        console.error("Error submitting profile:", error);
        toast.error(error.response?.data?.message || "Failed to update profile.");
      }
    } else {
      toast.error("Passwords do not match");
    }
  };

  return {
    formData,
    setFormData,
    profileDraft,
    setProfileDraft,
    showPopup,
    setShowPopup,
    handleChange,
    handleSubmit,
    handleFileChange,
    handlePopupSubmit,
    setIsLoading,
    isLoading,
  };
};

export default useProfile;

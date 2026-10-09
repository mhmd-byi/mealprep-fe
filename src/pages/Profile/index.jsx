import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../components";
import { useRef } from "react";
import Popup from "../../components/common/Popup/Popup";
import useProfile from "./useProfile";
import usePasswordValidation from "../../hooks/usePasswordValidation";
import { useDashboard } from "../../components/common/Dashboard/useDashboard";
import { Helmet } from "react-helmet";
import { Loader } from "../../components";
import { Camera, Mail, Phone, MapPin, Lock } from "lucide-react";

const Profile = () => {
  const { userDetails, getInitials, setUserDetails } = useDashboard();

  const {
    showPopup,
    setShowPopup,
    handleSubmit,
    handleChange,
    handleFileChange,
    handlePopupSubmit,
    isLoading,
    formData,
  } = useProfile(setUserDetails);

  const initials = getInitials();

  const UserName = userDetails.firstName + " " + userDetails.lastName;

  const formRef = useRef(null);
  const { ValidationMessage } = usePasswordValidation(formRef, "password", "confirmPassword");

  const inputClass =
    "w-full px-3 py-2 text-sm text-gray-700 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-theme-color-1";
  const disabledInputClass =
    "w-full px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200 cursor-not-allowed";

  return (
    <div>
      {isLoading && (
        <div className="fixed inset-0 z-[999] flex justify-center items-center bg-black bg-opacity-50">
          <Loader />
        </div>
      )}
      <DashboardLayoutComponent>
        <Helmet>
          <title> {UserName} | Mealprep Profile </title>
        </Helmet>
        <Popup
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          title="Update Profile Photo"
          content={
            <div>
              <Input type="file" accept="image/*" onChange={handleFileChange} />
            </div>
          }
          buttons={[
            {
              label: "Cancel",
              onClick: () => setShowPopup(false),
              className: "bg-gray-100 text-gray-700 hover:bg-gray-200",
            },
            {
              label: "Update Profile Photo",
              onClick: handlePopupSubmit,
              className: "bg-theme-color-1 text-white hover:bg-black",
            },
          ]}
        />

        <div className="p-4 w-full text-left sm:p-6 md:p-8">
          <div className="mx-auto space-y-6 max-w-4xl">
            <div>
              <p className="text-sm text-gray-500">Dashboard &rsaquo; Profile</p>
              <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
              <p className="text-sm text-gray-500">Manage your personal details and account security.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex flex-col items-center p-6 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                {userDetails.profileImageUrl ? (
                  <img
                    src={userDetails.profileImageUrl}
                    alt="User"
                    className="object-cover w-32 h-32 rounded-full ring-4 ring-green-50"
                  />
                ) : (
                  <div className="flex justify-center items-center w-32 h-32 text-4xl font-bold text-white rounded-full bg-theme-color-1 ring-4 ring-green-50">
                    {initials}
                  </div>
                )}
                <p className="mt-4 text-lg font-bold text-gray-900">{UserName}</p>
                <p className="text-xs text-gray-400 capitalize">{userDetails.role || "Customer"}</p>
                <button
                  type="button"
                  onClick={() => setShowPopup(true)}
                  className="flex gap-1.5 items-center px-3 py-1.5 mt-4 text-sm font-semibold rounded-lg border-2 text-theme-color-1 border-theme-color-1 hover:bg-theme-color-1 hover:text-white"
                >
                  <Camera className="w-4 h-4" />
                  Change Photo
                </button>
              </div>

              <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
                <form ref={formRef} className="space-y-5" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">First Name</label>
                      <Input
                        type="text"
                        name="firstName"
                        id="firstName"
                        className={inputClass}
                        placeholder="First Name"
                        value={formData.firstName || userDetails.firstName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Last Name</label>
                      <Input
                        type="text"
                        name="lastName"
                        id="lastName"
                        className={inputClass}
                        placeholder="Last Name"
                        value={formData.lastName || userDetails.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        WhatsApp Number
                      </label>
                      <Input
                        type="number"
                        name="mobile"
                        id="mobile"
                        className={disabledInputClass}
                        placeholder="WhatsApp Number"
                        value={userDetails.mobile}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        Email Address
                      </label>
                      <Input
                        type="email"
                        name="email"
                        id="email"
                        className={disabledInputClass}
                        placeholder="Email Address"
                        value={userDetails.email}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div>
                      <label className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                        <Lock className="w-3.5 h-3.5 text-gray-400" />
                        New Password
                      </label>
                      <Input
                        type="password"
                        name="password"
                        id="password"
                        className={inputClass}
                        placeholder="Enter Password"
                        value={formData.password}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm font-medium text-gray-700">Confirm Password</label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className={inputClass}
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                      <div className="mt-1 text-xs">
                        <ValidationMessage />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex gap-1.5 items-center mb-1 text-sm font-medium text-gray-700">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      Postal Address
                    </label>
                    <Input
                      type="text"
                      name="postalAddress"
                      id="postal_address"
                      className={inputClass}
                      placeholder="Postal Address"
                      value={formData.postalAddress || userDetails.postalAddress}
                      onChange={handleChange}
                    />
                  </div>

                  <Button type="submit" classes="w-full justify-center">
                    Update Profile
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayoutComponent>
    </div>
  );
};

export default Profile;

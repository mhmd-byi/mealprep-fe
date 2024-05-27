import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { Button, Input } from "../../components";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import Popup from "../../components/common/Popup/Popup";
import useProfile from "./useProfile";
import usePasswordValidation from "../../hooks/usePasswordValidation";

const Profile = () => {
  const {
    formData,
    showPopup,
    setShowPopup,
    handleUpdateProfilePhoto,
    handleFileChange,
    profileImageUrl,
    handleSubmit,
    handleInputChange,
  } = useProfile();

  const UserName = formData.firstName + " " + formData.lastName;

  const formRef = useRef(null);
  const { ValidationMessage } = usePasswordValidation(
    formRef,
    "newPassword",
    "confirmNewPassword"
  );

  return (
    <DashboardLayoutComponent>
      <Popup
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        title="Update Profile Photo"
        content={
          <div>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e.target.files[0])}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        }
        buttons={[
          {
            label: "Cancel",
            onClick: () => setShowPopup(false),
            className: "bg-gray-300 text-gray-700",
          },
          {
            label: "Update Profile Photo",
            onClick: handleUpdateProfilePhoto,
            className:
              "flex justify-center rounded-md bg-theme-color-1 px-5 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
          },
        ]}
      />
      <div className="flex flex-col justify-center items-center p-5 w-full h-auto lg:h-full ">
        <div className="bg-white shadow-md rounded-theme-radius p-3 md:p-10 lg:p-20 block md:block lg:flex lg:gap-20 max-w-[1500px] mx-auto my-auto">
          <div className="w-full lg:w-2/6 p-0 md:p-2 lg:p-5 flex flex-col items-center lg:items-start justify-center">
            <img
              src={profileImageUrl}
              alt="User"
              className="w-40 h-40 lg:w-60 lg:h-60 object-cover rounded-lg"
            />
            <h1 className="text-2xl mt-3 text-center lg:text-left">
              {UserName}
            </h1>
            <a
              className="text-sm mt-3 flex items-center justify-center text-[#A6A6A6]"
              onClick={() => setShowPopup(true)}
            >
              Change Profile Picture{" "}
              {<PencilSquareIcon className="h-4 w-4 ml-2" />}
            </a>
          </div>
          <div className="w-fit mt-5 lg:w-4/6 lg:p-12">
            <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <Input
                    type={"text"}
                    name={"firstName"}
                    id={"firstName"}
                    className="appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                    placeholder={"First Name"}
                    required={true}
                    value={formData.firstName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <Input
                    type={"text"}
                    name={"lastName"}
                    id={"lastName"}
                    className="appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                    placeholder={"Last Name"}
                    required={true}
                    value={formData.lastName}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <Input
                type={"number"}
                name={"whatsappNumber"}
                id={"whatsappNumber"}
                className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder={"WhatsApp Number"}
                required={true}
                value={formData.whatsappNumber}
                onChange={handleInputChange}
              />
              <Input
                type={"email"}
                name={"email"}
                id={"email"}
                className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder={"Email Address"}
                required
                value={formData.email}
                onChange={handleInputChange}
              />
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <Input
                    type={"text"}
                    name={"newPassword"}
                    id={"newPassword"}
                    className="appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                    placeholder={"Enter Password"}
                    required={true}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <Input
                    type={"text"}
                    name={"confirmNewPassword"}
                    id={"confirmNewPassword"}
                    className="appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                    placeholder={"Confirm Password"}
                    required={true}
                    value={formData.confirmNewPassword}
                    onChange={handleInputChange}
                  />
                  <ValidationMessage />
                </div>
              </div>
              <Input
                type={"text"}
                name={"postalAddress"}
                id={"postal_address"}
                className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder={"Postal Address"}
                required={true}
                value={formData.postalAddress}
                onChange={handleInputChange}
              />
              <Button
                type={"submit"}
                className="w-full text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
                children={"Update"}
              />
            </form>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

export default Profile;

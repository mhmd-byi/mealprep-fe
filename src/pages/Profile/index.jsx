import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { useState } from "react";
import UserImage from "../../assets/images/user/user-image.png";
import { Button, Input } from "../../components";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import Popup from "../../components/common/Popup/Popup";

const UserName = "John Doe";

const Profile = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleUpdateProfilePhoto = () => {
    // Perform update action here with selectedFile
    console.log("Selected file:", selectedFile);
    setShowPopup(false);
  };

  const handleFileChange = (file) => {
    setSelectedFile(file);
  };

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
          <div className="w-fit lg:w-2/6 p-0 md:p-2 lg:p-5">
            <img
              src={UserImage}
              alt="User"
              className="w-full h-auto object-cover rounded-lg"
            />
            <h1 className="text-2xl mt-3">{UserName}</h1>
            <a
              className="text-sm mt-3 flex items-center justify-center text-[#A6A6A6]"
              onClick={() => setShowPopup(true)}
            >
              Change Profile Picture{" "}
              {<PencilSquareIcon className="h-4 w-4 ml-2" />}
            </a>
          </div>
          <div className="w-fit mt-5 lg:w-4/6 lg:p-12">
            <form className="space-y-6">
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <Input
                    type={"text"}
                    name={"first-name"}
                    id={"first-name"}
                    className="appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                    placeholder={"First Name"}
                    required={true}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <Input
                    type={"text"}
                    name={"last-name"}
                    id={"last-name"}
                    className="appearance-none block w-full bg-gray-100 text-gray-700 border rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white"
                    placeholder={"Last Name"}
                    required={true}
                  />
                </div>
              </div>
              <Input
                type={"number"}
                name={"whatsapp_number"}
                id={"whatsapp_number"}
                className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder={"WhatsApp Number"}
                required={true}
              />
              <Input
                type={"email"}
                name={"email"}
                id={"email"}
                className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder={"Email Address"}
                required
              />
              <Input
                type={"text"}
                name={"postal_address"}
                id={"postal_address"}
                className="appearance-none block w-full bg-gray-100 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                placeholder={"Postal Address"}
                required={true}
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

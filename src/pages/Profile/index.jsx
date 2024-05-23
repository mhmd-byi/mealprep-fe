import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import UserImage from "../../assets/images/user/user-image.png";
import { Button, Input } from "../../components";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
const UserName = "John Doe";

const Profile = () => {
  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full h-full">
        <div className="bg-white shadow-md rounded-theme-radius p-20 flex gap-20 overflow-hidden max-w-[1500px] mx-auto my-auto">
          {/* Image container */}
          <div className="w-2/6 p-5">
            <img
              src={UserImage}
              alt="User"
              className="w-full h-auto object-cover rounded-lg"
            />
            <h1 className="text-2xl mt-3">{UserName}</h1>
            <a className="text-sm mt-3 flex items-center justify-center text-[#A6A6A6]">
              Change Profile Picture{" "}
              {<PencilSquareIcon className="h-4 w-4 ml-2" />}
            </a>
          </div>
          {/* Form container */}
          <div className="w-4/6 p-12">
            <form className="space-y-6">
              {/* Input fields structured with Tailwind CSS */}
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
                className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
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

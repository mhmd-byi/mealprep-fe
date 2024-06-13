import DashboardLayoutComponent from "../../components/common/Dashboard/Dashboard";
import { useDashboard } from "../../components/common/Dashboard/useDashboard";
import { useRef, useState } from "react";
import { Button, Input } from "../../components";
import emailjs from "emailjs-com";

export const Feedback = () => {
  const form = useRef();
  const [resultMessage, setResultMessage] = useState("");

  const sendEmail = (e) => {
    e.preventDefault();
    emailjs
      .sendForm(
        process.env.REACT_APP_EMAILJS_SERVICE_ID,
        process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        e.target,
        process.env.REACT_APP_EMAILJS_USER_ID
      )
      .then(
        (result) => {
          console.log(result);
          setResultMessage(
            "Thank you for your message! We'll get in touch soon."
          );
        },
        (error) => {
          console.log(error.text);
        }
      );
    e.target.reset();
  };

  const { userDetails, getInitials } = useDashboard();
  const initials = getInitials();
  const UserName = userDetails.firstName + " " + userDetails.lastName;
  return (
    <DashboardLayoutComponent>
      <div className="flex flex-col justify-center items-center p-5 w-full h-auto lg:h-full ">
        <div className="bg-white shadow-md rounded-theme-radius p-3 md:p-10 lg:p-20 block md:block lg:flex lg:gap-20 max-w-[1500px] mx-auto my-auto">
          <div className="w-full lg:w-2/6 p-0 md:p-2 lg:p-5 flex flex-col items-center lg:items-center justify-center">
            {userDetails.profileImageUrl ? (
              <img
                src={userDetails.profileImageUrl}
                alt="User"
                className="lg:w-60 lg:h-60 object-cover rounded-theme-radius lg:rounded-lg"
              />
            ) : (
              <div className="lg:w-60 lg:h-60 flex items-center justify-center rounded-theme-radius lg:rounded-lg text-white font-bold text-6xl bg-theme-color-1">
                {initials}
              </div>
            )}
            <h1 className="text-2xl mt-3 text-center lg:text-left">
              {UserName}
            </h1>
          </div>
          <div className="w-fit mt-5 lg:p-12">
            <form ref={form} className="space-y-6" onSubmit={sendEmail}>
              <Input
                type={"text"}
                name={"name"}
                id={"name"}
                className="cursor-pointer"
                value={userDetails.firstName + " " + userDetails.lastName}
                disabled={true}
              />
              <div className="flex flex-wrap -mx-3 mb-6">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                  <Input
                    type={"email"}
                    name={"email"}
                    id={"email"}
                    value={userDetails.email}
                    disabled={true}
                  />
                </div>
                <div className="w-full md:w-1/2 px-3">
                  <Input
                    type={"number"}
                    name={"phone"}
                    id={"phone"}
                    placeholder={"Phone Number"}
                  />
                </div>
              </div>
              <textarea
                name="postContent"
                rows={4}
                placeholder={`${userDetails.firstName}'s message`}
                className="block w-full rounded-lg border-0 px-5 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-theme-color-1 focus:border-theme-color-1 sm:text-sm sm:leading-6"
              />
              <Button
                type={"submit"}
                className="w-full text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
                children={"Submit"}
              />
              <div className="mt-5 text-lg text-theme-color-1 font-bold">
                {resultMessage}
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayoutComponent>
  );
};

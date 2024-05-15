import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input } from "../../components";

const Signup = () => {
  const navigate = useNavigate();
  const navigateToSignin = () => navigate("/");
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="flex max-h-[680px] px-12 py-8 shadow-md bg-white rounded-lg">
          <div className="content">
            <h2 className="text-center font-medium text-5xl">Sign Up</h2>
            <p className="mt-10 text-center text-lg">
              Enter your information below to proceed. <br />
              If you already have an account, please log in instead.
            </p>
            <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
              <form class="space-y-6">
                <div class="flex flex-wrap -mx-3 mb-6">
                  <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <Input
                      id={"first-name"}
                      name={"first-name"}
                      type={"text"}
                      placeholder={"First Name"}
                      required={true}
                    />
                  </div>
                  <div class="w-full md:w-1/2 px-3">
                    <Input
                      id={"last-name"}
                      name={"last-name"}
                      type={"text"}
                      placeholder={"Last Name"}
                      required={true}
                    />
                  </div>
                </div>
                <div class="w-full">
                  <Input
                    required={true}
                    id={"address"}
                    name={"address"}
                    type={"text"}
                    placeholder={"Address"}
                  />
                </div>
                <div class="w-full">
                  <Input
                    id={"register-email"}
                    name={"register-email"}
                    type={"email"}
                    // autocomplete="email"
                    required={true}
                    placeholder={"Email Address"}
                  />
                </div>
                <div class="w-full">
                  <Input
                    id={"register-phone-number"}
                    name={"register-phone-number"}
                    type={"tel"}
                    // autocomplete="email"
                    required={true}
                    placeholder={"Phone Number"}
                  />
                </div>
                <Button type={"submit"} children={"Submit"} />
              </form>
              <p class="mt-10 text-center text-sm text-gray-500">
                Already have an account? &nbsp;
                <a
                  onClick={navigateToSignin}
                  class="cursor-pointer font-semibold text-black-200 hover:text-black-500 hover:text-theme-color-1 hover:underline hover:decoration-solid"
                >
                  Login
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;

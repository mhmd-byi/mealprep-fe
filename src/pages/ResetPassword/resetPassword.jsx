import { Button, Input, MealprepLogo } from "../../components";
const ResetPassword = () => {
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="px-12 flex flex-col items-center justify-center py-8 shadow-md bg-white rounded-lg lg:h-[650px] lg:w-[450px] my-auto">
          <MealprepLogo classes={"text-center justify-center max-w-52"} />
          <h2 className="text-center font-medium text-4xl">New Password</h2>
          <div className="content w-full">
            <p className="mt-10 text-center text-lg">Enter New Password</p>
              <form class="space-y-6 mt-10 w-full">
                <div class="w-full">
                  <Input
                    id={"password"}
                    name={"password"}
                    type={"password"}
                    required
                    placeholder={"Enter Password"}
                  />
                </div>
                <div class="w-full">
                  <Input
                    id={"confirmPassword"}
                    name={"confirmPassword"}
                    type={"password"}
                    required
                    placeholder={"Confirm Password"}
                  />
                </div>
                <Button type="submit">Confirm</Button>
              </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

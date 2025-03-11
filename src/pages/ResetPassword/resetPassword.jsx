import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button, Input, MealprepLogo } from "../../components";
import axios from "axios";
const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}user/reset-password/${token}`, { password });
      setMessage('Password updated successfully.');
    } catch (err) {
      setMessage('Failed to reset password.');
    }
  };
  return (
    <div className="relative flex flex-col items-center justify-center h-screen bg-theme-bg-2 bg-no-repeat bg-cover">
      <div className="flex justify-center">
        <div className="px-12 flex flex-col items-center justify-center py-8 shadow-md bg-white rounded-lg lg:h-[650px] lg:w-[450px] my-auto">
          <MealprepLogo classes={"text-center justify-center max-w-52"} />
          <h2 className="text-center font-medium text-4xl">New Password</h2>
          <div className="content w-full">
            <p className="mt-10 text-center text-lg">Enter New Password</p>
              <form class="space-y-6 mt-10 w-full" onSubmit={handleSubmit}>
                <div class="w-full">
                  <Input
                    id={"password"}
                    name={"password"}
                    type={"password"}
                    required
                    placeholder={"Enter Password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button type="submit">Reset Password</Button>
                {message && <p className="text-center text-green-500">{message}</p>}
              </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

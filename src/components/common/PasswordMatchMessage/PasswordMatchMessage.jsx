import { CheckCircle, ErrorOutline } from "@mui/icons-material";

export const PasswordMatchMessage = ({ password, confirmPassword }) => {
  if (!confirmPassword) return null;

  const matches = password === confirmPassword;
  const color = matches ? "text-green-500" : "text-red-500";
  const Icon = matches ? CheckCircle : ErrorOutline;

  return (
    <div className={`flex items-center ${color}`}>
      <Icon className={`h-5 w-5 ${color}`} />
      <span className="ml-2">{matches ? "Passwords match!" : "Passwords do not match!"}</span>
    </div>
  );
};

export default PasswordMatchMessage;

import { Utensils, CalendarCheck, Activity } from "lucide-react";
import whiteLogo from "../../../assets/images/logo/white-logo.png";
import authBg from "../../../assets/images/auth-bg.png";

const FEATURES = [
  { icon: Utensils, text: "Fresh, chef-prepped meals delivered daily" },
  { icon: CalendarCheck, text: "Flexible weekly, monthly and trial plans" },
  { icon: Activity, text: "Customize, pause and track every meal" },
];

export const AuthLayout = ({ heading, subheading, maxWidthClass = "max-w-sm", children }) => (
  <div className="flex min-h-screen bg-white">
    <div
      className="relative items-center justify-center flex-1 hidden bg-center bg-cover lg:flex bg-theme-color-1"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="relative z-10 max-w-md px-10 text-white">
        <img src={whiteLogo} alt="Mealprep" className="mb-10 w-40" />
        <h1 className="text-3xl font-bold leading-tight">{heading}</h1>
        <p className="mt-3 text-green-50">{subheading}</p>
        <div className="mt-10 space-y-5">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-3">
              <div className="flex items-center justify-center flex-shrink-0 w-9 h-9 rounded-lg bg-white/15">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-green-50">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="flex flex-1 items-center justify-center px-6 py-12 overflow-y-auto sm:px-10">
      <div className={`w-full ${maxWidthClass}`}>{children}</div>
    </div>
  </div>
);

export default AuthLayout;

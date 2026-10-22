import { Utensils, CalendarCheck, Activity } from "lucide-react";
import whiteLogo from "../../../assets/images/logo/white-logo.png";
import authBg from "../../../assets/images/auth-bg.png";

const FEATURES = [
  { icon: Utensils, text: "Fresh, chef-prepped meals delivered daily" },
  { icon: CalendarCheck, text: "Flexible weekly, monthly and trial plans" },
  { icon: Activity, text: "Customize, pause and track every meal" },
];

export const AuthLayout = ({ heading, subheading, maxWidthClass = "max-w-sm", children }) => (
  <div className="flex min-h-screen bg-green-50">
    <div
      className="hidden relative flex-1 justify-center items-center bg-center bg-cover lg:flex bg-theme-color-1"
      style={{ backgroundImage: `url(${authBg})` }}
    >
      <div className="relative z-10 px-10 max-w-md text-white">
        <img src={whiteLogo} alt="Mealprep" className="mx-auto mb-10 w-40" />
        <h1 className="text-3xl font-bold leading-tight">{heading}</h1>
        <p className="mt-3 text-green-50">{subheading}</p>
        <div className="mt-10 space-y-5">
          {FEATURES.map(({ icon: Icon, text }) => (
            <div key={text} className="flex gap-3 items-center">
              <div className="flex flex-shrink-0 justify-center items-center w-9 h-9 rounded-lg bg-white/15">
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-green-50">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="flex overflow-y-auto flex-1 justify-center items-center px-4 py-12 sm:px-10 lg:bg-white">
      <div className={`p-6 w-full bg-white rounded-2xl shadow-sm ${maxWidthClass} sm:p-8 lg:bg-transparent lg:shadow-none lg:p-0`}>
        {children}
      </div>
    </div>
  </div>
);

export default AuthLayout;

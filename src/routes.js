import { ForgotPassword, ResetPassword, Signup } from "./pages";
import ResetPasswordSuccess from "./pages/Password-Reset-Success/resetPasswordSuccess";
import Login from "./pages/login/login";
import Profile from "./pages/Profile";
import FoodMenu from "./pages/Food-Menu";
import SubscriptionPlans from "./pages/Plans";
export const routes = [
  {
    path: "/login",
    component: Login,
    exact: true,
  },
  {
    path: "/signup",
    component: Signup,
    exact: true,
  },
  {
    path: "/forgot-password",
    component: ForgotPassword,
    exact: true,
  },
  {
    path: "/reset-password-successfully",
    component: ResetPasswordSuccess,
    exact: true,
  },
  {
    path: "/reset-password",
    component: ResetPassword,
    exact: true,
  },
  {
    path: "/dashboard/profile",
    component: Profile,
    exact: true,
  },
  {
    path: "/",
    component: FoodMenu,
    exact: true,
  },
  {
    path: "/dashboard/plans",
    component: SubscriptionPlans,
    exact: true,
  }
];

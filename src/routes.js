import { ForgotPassword, ResetPassword, Signup } from "./pages";
import ResetPasswordSuccess from "./pages/Password-Reset-Success/resetPasswordSuccess";
import Login from "./pages/login/login";
import Profile from "./pages/Profile";
import FoodMenu from "./pages/Food-Menu";
import SubscriptionPlans from "./pages/Plans";
import { Feedback } from "./pages/feedback";
import { DashboardPage } from "./pages/Dashboard";
import { MealCalendar } from "./pages/Meal-Calendar";
import { HelpPage } from "./pages/Help";
import { MyPlan } from "./pages/My-Plans";
import AddMeal from "./pages/Admin/Add-Meal";
export const routes = [
  {
    path: "/",
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
    path: "/dashboard/food-menu",
    component: FoodMenu,
    exact: true,
  },
  {
    path: "/dashboard/plans",
    component: SubscriptionPlans,
    exact: true,
  },
  {
    path: "/dashboard/feedback",
    component: Feedback,
    exact: true,
  },
  {
    path: "/dashboard",
    component: DashboardPage,
    exact: true,
  },
  {
    path: "/dashboard/meal-calendar",
    component: MealCalendar,
    exact: true,
  },
  {
    path: "/dashboard/help",
    component: HelpPage,
    exact: true,
  },
  {
    path: "/dashboard/my-billing",
    component: MyPlan,
    exact: true,
  },
  {
    path: "/dashboard/add-menu",
    component: AddMeal,
    exact: true,
  }
];

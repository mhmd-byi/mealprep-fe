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
import CancelRequest from "./pages/Cancel-Request";
import { UserListWithCancelRequest } from "./pages/Admin/User-List-of-Cancel-Request";
import { UserListOfMealDelivery } from "./pages/Admin/User-List-Of-Meal-Delivery";
import { CustomizeYourMeal } from "./pages/customize-your-meal";
import { AllRegisteredUsers } from "./pages/Admin/All-Registered-Users";
import { UserListWithCustomisationRequest } from "./pages/Admin/User-List-of-Customisation-Request";
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
  },
  {
    path: "/dashboard/cancel-request",
    component: CancelRequest,
    exact: true,
  },
  {
    path: "/dashboard/user-cancel-request-list",
    component: UserListWithCancelRequest,
    exact: true,
  },
  {
    path: "/dashboard/meal-delivery-list",
    component: UserListOfMealDelivery,
    exact: true,
  },
  {
    path: "/dashboard/customize-your-meal",
    component: CustomizeYourMeal,
    exact: true,
  },
  {
    path: "/dashboard/all-registered-users",
    component: AllRegisteredUsers,
    exact: true,
  },
  {
    path: "/dashboard/get-list-of-customisation-request",
    component: UserListWithCustomisationRequest,
    exact: true,
  }
];

import { FaClipboardList, FaFileInvoice, FaBookOpen, FaUserCircle, FaListAlt, FaMapMarkedAlt } from "react-icons/fa";
import { MdAdminPanelSettings, MdManageAccounts} from "react-icons/md";


// Import all route components
// user pages
import MyBookings from "../pages/user/MyBookings"; 
import MyPayments from "../pages/user/MyPayments";
import NicheBooking from "../pages/user/NicheBooking";
import Profile from "../pages/general/Profile";

// staff pages
import SearchBooking from "../pages/staff/SearchBooking";
import NicheBookingStaff from "../pages/staff/NicheBookingStaff";
import BookingApproval from "../pages/staff/BookingApproval";
import PendingApprovals from "../pages/staff/PendingApprovals";

// admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import NicheManagement from "../pages/admin/NicheManagement";
import UserManagement from "../pages/admin/UserManagement";

import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Logout from "../pages/public/Logout";
import Setup2FA from "../pages/public/Setup2FA";
import Login2FA from "../pages/public/Login2FA";
import ResetPassword from "../pages/public/ResetPassword";


// hidden pages
import RequestUrnPlacement from "../pages/user/RequestUrnPlacement";
import PaymentSuccess from '../pages/general/PaymentSuccess';

// for role redirect
import RoleRedirect from "../components/navigation/RoleRedirect";

// PUBLIC
export const publicRoutes = [
  {
    label: "Home",
    path: "/",
    element: <RoleRedirect />,
  },
  {
    label: "About Us",
    path: "/about",
  },
  {
    label: "FAQ",
    path: "/faq",
  },
  {
    label: "Login",
    path: "/login",
    element: <Login />,
  },
  {
    label: "Register",
    path: "/register",
    element: <Register />,
    
  },
  {
    path: "/setup-2fa",
    element: <Setup2FA />,
  },
  {
    path: "/login-2fa",
    element: <Login2FA />,
  },
  {
  path: "/reset-password",
  element: <ResetPassword />,
  },
];

// USER
export const userRoutes = [
  {
    label: "My Bookings",
    path: "/my-bookings",
    icon: <FaClipboardList />,
    element: <MyBookings />,
    requiredRoles: ["user"]
  },
  {
    label: "My Payments",
    path: "/my-payments",
    icon: <FaFileInvoice />,
    element: <MyPayments />,
    requiredRoles: ["user"]
  },
  {
    label: "Book a Niche",
    path: "/book-niche",
    icon: <FaBookOpen />,
    element: <NicheBooking />,
    requiredRoles: ["user"]
  },
  {
    label: "My Profile",
    path: "/profile",
    icon: <FaUserCircle />,
    element: <Profile />,
    requiredRoles: ["user", "staff", "admin"]
  },
  {
    label: "Logout",
    path: "/logout",
    element: <Logout />,
    requiredRoles: ["user", "staff", "admin"]
  }
];

// STAFF
export const staffRoutes = [
  {
    label: "Search Booking",
    path: "/search-booking",
    icon: <FaListAlt />,
    element: <SearchBooking />,
    requiredRoles: ["staff"]
  },
  {
    label: "Pending Approvals",
    path: "/pending-approvals",
    icon: <FaListAlt />,
    element: <PendingApprovals />,
    requiredRoles: ["staff"]
  },
  {
    label: "Niche Booking",
    path: "/niche-booking",
    icon: <FaMapMarkedAlt />,
    element: <NicheBookingStaff />,
    requiredRoles: ["staff"]
  }
];

// ADMIN
export const adminRoutes = [
  {
    label: "Admin Dashboard",
    path: "/admin-dashboard",
    icon: <MdAdminPanelSettings />,
    element: <AdminDashboard />,
    requiredRoles: ["admin"]
  },
  {
    label: "Niche Management",
    path: "/niche-management",
    icon: <FaMapMarkedAlt />,
    element: <NicheManagement />,
    requiredRoles: ["admin"]
  },
  {
    label: "User Management",
    path: "/user-management",
    icon: <MdManageAccounts />,
    element: <UserManagement />,
    requiredRoles: ["admin"]
  }
];

export const hiddenRoutes = [
  {
    path: "/booking-approval/:bookingID",
    element: <BookingApproval />,
    requiredRoles: ["staff"]
  },
  {
    path: "/payment-success",
    element: <PaymentSuccess />,
    requiredRoles: ["user", "staff"]
  },
  {
    label: "RequestUrnPlacement",
    path: "/req-urn-placement",
    element: <RequestUrnPlacement />,
    requiredRoles: ["user"]
  },
];



// Combined all for routing
export const appRoutes = [
  ...publicRoutes,
  ...userRoutes,
  ...staffRoutes,
  ...adminRoutes,
  ...hiddenRoutes
];

export const publicPaths = publicRoutes.map(route => route.path);

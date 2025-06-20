import { FaClipboardList, FaFileInvoice, FaBookOpen, FaUserCircle, FaListAlt, FaMapMarkedAlt, FaPlusSquare, FaClipboardCheck } from "react-icons/fa";
import { MdDashboard, MdAdminPanelSettings, MdApartment} from "react-icons/md";

// Import all route components
import MyBookings from "../pages/user/MyBookings"; 
import MyPayments from "../pages/MyPayments";
import NicheBooking from "../pages/NicheBooking";
import Profile from "../pages/Profile";

import Dashboard from "../pages/staff/Dashboard";
import SearchBooking from "../pages/staff/SearchBooking";
import NicheManagement from "../pages/staff/NicheManagement";
import BookingApproval from "../pages/staff/BookingApproval";
import PendingApprovals from "../pages/staff/PendingApprovals";

import AdminDashboard from "../pages/admin/AdminDashboard";
import BuildingManagement from "../pages/admin/BuildingManagement";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import LandingPage from "../pages/public/LandingPage";

// PUBLIC
export const publicRoutes = [
  {
    label: "Home",
    path: "/",
    element: <LandingPage />,
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
  }
];

// USER
export const userRoutes = [
  {
    label: "My Bookings",
    path: "/my-bookings",
    icon: <FaClipboardList />,
    element: <MyBookings />,
  },
  {
    label: "My Payments",
    path: "/my-payments",
    icon: <FaFileInvoice />,
    element: <MyPayments />,
  },
  {
    label: "Book a Niche",
    path: "/book-niche",
    icon: <FaBookOpen />,
    element: <NicheBooking />,
  },
  {
    label: "My Profile",
    path: "/profile",
    icon: <FaUserCircle />,
    element: <Profile />,
  },
];

// STAFF
export const staffRoutes = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <MdDashboard />,
    element: <Dashboard />,
  },
  {
    label: "Search Booking",
    path: "/search-booking",
    icon: <FaListAlt />,
    element: <SearchBooking />,
  },
  {
    label: "Pending Approvals",
    path: "/pending-approvals",
    icon: <FaListAlt />,
    element: <PendingApprovals />,
  },
  {
    label: "Niche Management",
    path: "/niche-management",
    icon: <FaMapMarkedAlt />,
    element: <NicheManagement />,
  },
];

// ADMIN
export const adminRoutes = [
  {
    label: "Admin Dashboard",
    path: "/admin-dashboard",
    icon: <MdAdminPanelSettings />,
    element: <AdminDashboard />,
  },
  {
    label: "Building Management",
    path: "/building-management",
    icon: <MdApartment />,
    element: <BuildingManagement />,
  },
];

export const hiddenRoutes = [
  {
    path: "/booking-approval/:bookingID",
    element: <BookingApproval />,
  }
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

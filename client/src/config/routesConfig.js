import { FaClipboardList, FaFileInvoice, FaBookOpen, FaUserCircle, FaListAlt, FaMapMarkedAlt, FaPlusSquare, FaClipboardCheck } from "react-icons/fa";
import { MdDashboard, MdAdminPanelSettings, MdApartment} from "react-icons/md";

// Import all route components
import MyBookings from "../pages/Main/MyBookings"; 
import MyPayments from "../pages/MyPayments";
import NicheBooking from "../pages/NicheBooking";
import Profile from "../pages/Profile";

import Dashboard from "../pages/Staff/Dashboard";
import AllBookings from "../pages/Admin/AllBookings";
import NicheManagement from "../pages/Staff/NicheManagement";
import AddBooking from "../pages/AddBooking";

import AdminDashboard from "../pages/Admin/AdminDashboard";
import BuildingManagement from "../pages/Admin/BuildingManagement";
//import Login from "./pages/Main/Login";
import LandingPage from "../pages/Main/LandingPage";

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
  /*{
    label: "Login",
    path: "/login",
    element: <Login />,
  },*/
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
    label: "All Bookings",
    path: "/all-bookings",
    icon: <FaListAlt />,
    element: <AllBookings />,
  },
  {
    label: "Niche Management",
    path: "/niche-management",
    icon: <FaMapMarkedAlt />,
    element: <NicheManagement />,
  },
  {
    label: "Add Booking",
    path: "/add-booking",
    icon: <FaPlusSquare />,
    element: <AddBooking />,
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

// Combined all for routing
export const appRoutes = [
  ...publicRoutes,
  ...userRoutes,
  ...staffRoutes,
  ...adminRoutes,
];

export const publicPaths = publicRoutes.map(route => route.path);

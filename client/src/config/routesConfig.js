import { FaClipboardList, FaFileInvoice, FaBookOpen, FaUserCircle, FaListAlt, FaMapMarkedAlt, FaPlusSquare, FaClipboardCheck } from "react-icons/fa";
import { MdDashboard, MdAdminPanelSettings } from "react-icons/md";

// Import all route components
//import MyBookings from "../pages/MyBookings"; - doesnt exist?
import MyPayments from "../pages/MyPayments";
import NicheBooking from "../pages/NicheBooking";
import Profile from "../pages/Profile";

import Dashboard from "../pages/Staff/Dashboard";
import AllBookings from "../pages/Admin/AllBookings";
import NicheMap from "../pages/Staff/NicheMap";
import AddBooking from "../pages/AddBooking";

import AdminDashboard from "../pages/Admin/AdminDashboard";

export const appRoutes = [
  // User
  // {
  //   label: "My Bookings",
  //   path: "/my-bookings",
  //   icon: <FaClipboardList />,
  //   element: <MyBookings />,
  // },
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

  // Staff
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
    label: "Niche Map View",
    path: "/niche-map-view",
    icon: <FaMapMarkedAlt />,
    element: <NicheMap />,
  },
  {
    label: "Add Booking",
    path: "/add-booking",
    icon: <FaPlusSquare />,
    element: <AddBooking />,
  },

  // Admin
  {
    label: "Admin Dashboard",
    path: "/admin-dashboard",
    icon: <MdAdminPanelSettings />,
    element: <AdminDashboard />,
  },
];

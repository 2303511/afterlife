import { FaClipboardList, FaFileInvoice, FaBookOpen, FaUserCircle, FaListAlt, FaMapMarkedAlt } from "react-icons/fa";
import { MdDashboard, MdAdminPanelSettings, MdApartment} from "react-icons/md";

// Import all route components
// user pages
import MyBookings from "../pages/user/MyBookings"; 
import MyPayments from "../pages/user/MyPayments";
import NicheBooking from "../pages/user/NicheBooking";
import Profile from "../pages/Profile";

// staff pages
import Dashboard from "../pages/staff/Dashboard";
import SearchBooking from "../pages/staff/SearchBooking";
import NicheManagement from "../pages/staff/NicheManagement";
import BookingApproval from "../pages/staff/BookingApproval";
import PendingApprovals from "../pages/staff/PendingApprovals";

// admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import BuildingManagement from "../pages/admin/BuildingManagement";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import LandingPage from "../pages/public/LandingPage";

// hidden pages
import RequestUrnPlacement from "../pages/user/RequestUrnPlacement";
import PaymentSuccess from '../pages/PaymentSuccess';

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
];

// STAFF
export const staffRoutes = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: <MdDashboard />,
    element: <Dashboard />,
    requiredRoles: ["staff"]
  },
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
    label: "Niche Management",
    path: "/niche-management",
    icon: <FaMapMarkedAlt />,
    element: <NicheManagement />,
    requiredRoles: ["staff"]
  },
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
    label: "Building Management",
    path: "/building-management",
    icon: <MdApartment />,
    element: <BuildingManagement />,
    requiredRoles: ["admin"]
  },
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

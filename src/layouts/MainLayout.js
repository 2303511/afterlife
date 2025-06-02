import Sidebar from "../components/Sidebar";
import TopNavBar from "../components/TopNavBar";

export default function MainLayout({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1">
        <TopNavBar />
        <main className="p-3">{children}</main>
      </div>
    </div>
  );
}

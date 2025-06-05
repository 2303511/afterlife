import Sidebar from "../components/Sidebar";

export default function MainLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <div className="main-content">
        <main className="p-3">{children}</main>
      </div>
    </div>
  );
}

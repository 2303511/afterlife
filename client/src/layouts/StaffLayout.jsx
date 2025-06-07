import StaffNavigation from "../components/navigation/StaffNavigation";

export default function MainLayout({ children }) {
  return (
    <div>
      <StaffNavigation />
      <div className="main-content">
        <main className="p-3">{children}</main>
      </div>
    </div>
  );
}

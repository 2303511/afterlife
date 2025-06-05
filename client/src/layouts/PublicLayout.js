import MainNavigation from "../components/MainNavigation";

export default function PublicLayout({ children }) {
  return (
    <div>
      <MainNavigation />
      <div className="main-content">
        <main className="p-3">{children}</main>
      </div>
    </div>
  );
}

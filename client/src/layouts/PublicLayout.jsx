import MainNavigation from "../components/navigation/MainNavigation";

export default function PublicLayout({ children }) {
  return (
    <div>
      <MainNavigation />
      <main>{children}</main>
    </div>
  );
}

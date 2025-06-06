import MainNavigation from "../components/MainNavigation";

export default function PublicLayout({ children }) {
  return (
    <div>
      <MainNavigation />
      <main>{children}</main>
    </div>
  );
}

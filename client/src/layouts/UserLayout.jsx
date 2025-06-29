// src/layouts/UserLayout.js
import UserNavigation from "../components/navigation/UserNavigation";

export default function UserLayout({ children }) {
  return (
    <>
      <UserNavigation />
      <main className="container mt-4">{children}</main>
    </>
  );
}

import { useEffect } from "react";

export default function Dashboard() {
  useEffect(() => {
    fetch("/api/")
      .then((res) => res.text())
      .then((data) => {
        console.log("API Response:", data);
      })
      .catch((err) => {
        console.error("API call failed:", err);
      });
  }, []);

  return <h1>Dashboard Content</h1>;
}

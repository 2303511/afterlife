// src/components/RoleRedirect.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { retrieveSession } from "../../utils/retrieveSession";

// landing page
import LandingPage from "../../pages/public/LandingPage";

export default function RoleRedirect () {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // 1. kick off any redirects as soon as we know the user
  useEffect(() => {
    const init = async () => {
      let currUser = await retrieveSession();

      if (user) {
        switch (user.role) {
          case "user":
            navigate("/my-bookings", { replace: true });
            break;
          case "staff":
            navigate("/search-booking", { replace: true });
            break;
          case "admin":
            navigate("/dashboard", { replace: true });
            break;
          default:
            // unknown role – maybe treat as public
            break;
        }
      }

      setUser(currUser);
    }

    init();
    
  }, [user, navigate]);

  // 3) if there's no user, show the landing page
  if (!user) return <LandingPage />;

  return null;
}

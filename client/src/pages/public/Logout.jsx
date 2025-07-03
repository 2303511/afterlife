import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../auth/AuthContext";

export default function Logout() {
  const { logout } = useContext(AuthContext);
  const navigate   = useNavigate();

  useEffect(() => {
    logout().finally(() => {
      navigate("/login", { replace: true });
    });
  }, [logout, navigate]);

  return null;
}

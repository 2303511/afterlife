// Logout.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Logout() {
    const navigate = useNavigate();
    useEffect(() => {
        const doLogout = async () => {
            try {
                await fetch("/api/user/logout", {
                    method: "POST",
                    credentials: "include", 
                });
            } catch (err) {
            console.error("Logout error:", err);
            } finally {
                console.log("logout successful!!")
                navigate("/login", { replace: true });
            }
        };

        doLogout();
    }, [navigate]);

    return null;
}

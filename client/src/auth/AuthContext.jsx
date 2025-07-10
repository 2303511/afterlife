import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, check session
  useEffect(() => {
    axios
      .get("/api/user/me", { withCredentials: true })
      .then(res => {
        setUser({ userID: res.data.userID, role: res.data.role });
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Called after a successful Login to populate context
  const login = userData => {
    setUser(userData);
  };

  // Calls the logout endpoint, clears context
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout", {}, { withCredentials: true });
    } catch (e) {
      console.error("Logout failed", e);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// src/hooks/useAuth.js

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

// Export as a named export (which matches your import in other files)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

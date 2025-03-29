import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth.api";
import logger from "../utils/logger";

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const navigate = useNavigate();

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          // No token found, user is not logged in
          setLoading(false);
          return;
        }

        // Try to get user data from localStorage first for faster loading
        const storedUser = localStorage.getItem("user");

        if (storedUser) {
          try {
            // Parse stored user data
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);

            // Still verify with the server in the background
            const response = await getCurrentUser();

            if (response.success && response.user) {
              // Update user data if it has changed
              setUser(response.user);
              localStorage.setItem("user", JSON.stringify(response.user));
            }
          } catch (parseError) {
            console.error("Error parsing user data", parseError);

            // Clear invalid data
            localStorage.removeItem("user");

            // Try to get user data from server
            const response = await getCurrentUser();

            if (response.success && response.user) {
              setUser(response.user);
              setIsAuthenticated(true);
              localStorage.setItem("user", JSON.stringify(response.user));
            } else {
              // Invalid token or user data
              localStorage.removeItem("token");
              setIsAuthenticated(false);
            }
          }
        } else {
          // No stored user data, try to get from server
          try {
            const response = await getCurrentUser();

            if (response.success && response.user) {
              setUser(response.user);
              setIsAuthenticated(true);
              localStorage.setItem("user", JSON.stringify(response.user));
            } else {
              // Invalid token
              localStorage.removeItem("token");
              setIsAuthenticated(false);
            }
          } catch (apiError) {
            console.error("Error getting current user:", apiError);
            localStorage.removeItem("token");
            setIsAuthenticated(false);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Auth check error:", err);
        setLoading(false);
        setError("Authentication error");
        setIsAuthenticated(false);
      }
    };

    checkUser();
  }, []);

  // Register user
  const registerUser = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      // Make API request (will be handled by the actual API service)
      // For demonstration, we're just simulating a successful response
      const { register } = await import("../api/auth.api");
      const response = await register(userData);

      if (response.success && response.token) {
        // Save token and user data
        localStorage.setItem("token", response.token);

        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
          setUser(response.user);
        }

        setIsAuthenticated(true);
        setLoading(false);

        // Redirect to dashboard
        navigate("/dashboard");

        return { success: true };
      } else {
        throw new Error(response.error || "Registration failed");
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.userMessage ||
        err.message ||
        "An error occurred during registration";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Login user
  const loginUser = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      // Make API request (will be handled by the actual API service)
      const { login } = await import("../api/auth.api");
      const response = await login(credentials);

      if (response.success && response.token) {
        // Save token and user data
        localStorage.setItem("token", response.token);

        if (response.user) {
          localStorage.setItem("user", JSON.stringify(response.user));
          setUser(response.user);
        }

        setIsAuthenticated(true);
        setLoading(false);

        // Redirect to dashboard
        navigate("/dashboard");

        return { success: true };
      } else {
        throw new Error(response.error || "Login failed");
      }
    } catch (err) {
      setLoading(false);
      const errorMessage =
        err.userMessage || err.message || "Invalid credentials";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Logout user
  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        registerUser,
        loginUser,
        logoutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

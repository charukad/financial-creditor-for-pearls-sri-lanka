import API from "./index";

// Register a new user
export const register = async (userData) => {
  try {
    console.log("📝 Preparing to register user:", {
      ...userData,
      password: "[REDACTED]",
    });

    // Validate user data before sending
    if (
      !userData.email ||
      !userData.password ||
      !userData.fullName ||
      !userData.companyName
    ) {
      throw new Error("Missing required registration fields");
    }

    const response = await API.post("/auth/register", userData);

    console.log("✅ Registration successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Registration failed:", error);

    // Create a user-friendly error message
    let errorMessage = "Registration failed";

    if (error.data?.error) {
      // Use server-provided error message
      errorMessage = error.data.error;
    } else if (error.status === 400) {
      errorMessage = "Invalid registration data. Please check your details.";
    } else if (error.status === 409) {
      errorMessage = "A user with this email already exists.";
    } else if (error.status === 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }

    throw { ...error, userMessage: errorMessage };
  }
};

// Login user
export const login = async (credentials) => {
  try {
    console.log("🔑 Attempting login for:", credentials.email);
    const response = await API.post("/auth/login", credentials);
    console.log("✅ Login successful");
    return response.data;
  } catch (error) {
    console.error("❌ Login failed:", error);

    let errorMessage = "Login failed";

    if (error.data?.error) {
      errorMessage = error.data.error;
    } else if (error.status === 401) {
      errorMessage = "Invalid email or password.";
    } else if (error.status === 500) {
      errorMessage = "Server error. Please try again later.";
    } else if (!error.status) {
      errorMessage = "Network error. Please check your connection.";
    }

    throw { ...error, userMessage: errorMessage };
  }
};

// Get current user
export const getCurrentUser = async () => {
  try {
    const response = await API.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Failed to get current user:", error);
    throw error;
  }
};

// Test direct MongoDB save
export const testMongoDB = async () => {
  try {
    const response = await API.post("/auth/test-mongo");
    return response.data;
  } catch (error) {
    console.error("MongoDB test failed:", error);
    throw error;
  }
};

// Direct registration (alternative endpoint)
export const directRegister = async (userData) => {
  try {
    const response = await API.post("/auth/direct-register", userData);
    return response.data;
  } catch (error) {
    console.error("Direct registration failed:", error);
    throw error;
  }
};

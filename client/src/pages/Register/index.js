import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, directRegister, testMongoDB } from "../../api/auth.api";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "apparel manufacturing",
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState(null);
  const [registrationMethod, setRegistrationMethod] = useState("standard"); // 'standard', 'direct', or 'test'

  const { companyName, industry, fullName, email, password, confirmPassword } =
    formData;

  const validateForm = () => {
    const newErrors = {};

    // Company name validation
    if (!companyName.trim()) {
      newErrors.companyName = "Company name is required";
    }

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    // Email validation
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    // Password validation
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing in the field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }

    // Clear server error when user makes any change
    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset messages and debug info
    setServerError("");
    setSuccessMessage("");
    setDebugInfo(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Create user data object
      const userData = {
        companyName,
        industry,
        fullName,
        email,
        password,
      };

      console.log("Starting registration process");
      console.log("Registration data:", {
        ...userData,
        password: "[REDACTED]",
      });
      console.log("Using registration method:", registrationMethod);

      let response;

      // Call appropriate API method based on selected registration method
      console.time("Registration API call");
      if (registrationMethod === "direct") {
        response = await directRegister(userData);
      } else if (registrationMethod === "test") {
        response = await testMongoDB();
        console.log("MongoDB test successful:", response);
        setSuccessMessage("MongoDB test successful. Test document created!");
        setIsSubmitting(false);
        return;
      } else {
        // Standard registration
        response = await register(userData);
      }
      console.timeEnd("Registration API call");

      console.log("Registration successful:", response);

      // Store token and user data
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      // Show success message
      setSuccessMessage(
        "Account created successfully! Redirecting to dashboard..."
      );

      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Registration error caught in component:", error);

      // Set user-friendly error message
      setServerError(
        error.userMessage || "Registration failed. Please try again."
      );

      // Set debug info
      setDebugInfo({
        message: error.message,
        status: error.status,
        data: error.data,
        originalError: error.originalError
          ? {
              message: error.originalError.message,
              name: error.originalError.name,
              code: error.originalError.code,
            }
          : null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>Create Account</h1>
          <p>Join our platform to start predicting your revenue</p>
        </div>

        <div className="register-form">
          {serverError && (
            <div className="alert alert-danger">{serverError}</div>
          )}

          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          <div className="registration-method">
            <p>
              <strong>Registration Method:</strong>
            </p>
            <div className="form-check">
              <input
                type="radio"
                id="standard"
                name="registrationMethod"
                value="standard"
                checked={registrationMethod === "standard"}
                onChange={() => setRegistrationMethod("standard")}
                className="form-check-input"
              />
              <label htmlFor="standard" className="form-check-label">
                Standard Registration
              </label>
            </div>

            <div className="form-check">
              <input
                type="radio"
                id="direct"
                name="registrationMethod"
                value="direct"
                checked={registrationMethod === "direct"}
                onChange={() => setRegistrationMethod("direct")}
                className="form-check-input"
              />
              <label htmlFor="direct" className="form-check-label">
                Direct Registration (Bypass Controller)
              </label>
            </div>

            <div className="form-check">
              <input
                type="radio"
                id="test"
                name="registrationMethod"
                value="test"
                checked={registrationMethod === "test"}
                onChange={() => setRegistrationMethod("test")}
                className="form-check-input"
              />
              <label htmlFor="test" className="form-check-label">
                Test MongoDB Connection Only
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className={`form-control ${
                  errors.companyName ? "is-invalid" : ""
                }`}
                value={companyName}
                onChange={onChange}
                required
              />
              {errors.companyName && (
                <div className="error-message">{errors.companyName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="industry">Industry</label>
              <select
                id="industry"
                name="industry"
                className="form-control"
                value={industry}
                onChange={onChange}
              >
                <option value="apparel manufacturing">
                  Apparel Manufacturing
                </option>
                <option value="textile production">Textile Production</option>
                <option value="garment export">Garment Export</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                className={`form-control ${
                  errors.fullName ? "is-invalid" : ""
                }`}
                value={fullName}
                onChange={onChange}
                required
              />
              {errors.fullName && (
                <div className="error-message">{errors.fullName}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={email}
                onChange={onChange}
                required
              />
              {errors.email && (
                <div className="error-message">{errors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                value={password}
                onChange={onChange}
                required
                minLength="6"
              />
              {errors.password && (
                <div className="error-message">{errors.password}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className={`form-control ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                value={confirmPassword}
                onChange={onChange}
                required
              />
              {errors.confirmPassword && (
                <div className="error-message">{errors.confirmPassword}</div>
              )}
            </div>

            <div className="form-group">
              <div className="form-check">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  className="form-check-input"
                  required
                />
                <label htmlFor="terms" className="form-check-label">
                  I agree to the Terms of Service and Privacy Policy
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="register-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          {debugInfo && (
            <div className="debug-info">
              <h3>Debug Information</h3>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>

              <div className="connection-status">
                <h4>Connection Status Checks</h4>
                <button
                  className="btn btn-info"
                  onClick={async () => {
                    try {
                      const response = await fetch(
                        "http://localhost:5009/api/auth/db-status"
                      );
                      const data = await response.json();
                      setDebugInfo({ ...debugInfo, dbStatus: data });
                    } catch (error) {
                      setDebugInfo({
                        ...debugInfo,
                        dbStatusError: error.message,
                      });
                    }
                  }}
                >
                  Check DB Status
                </button>
              </div>
            </div>
          )}

          <div className="register-footer">
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

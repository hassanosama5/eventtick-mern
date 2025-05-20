// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
    case "FORGOT_PASSWORD_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case "AUTH_FAILURE":
      return { ...state, error: action.payload, isLoading: false };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "FORGOT_PASSWORD_SUCCESS":
      return { ...state, isLoading: false, error: null };
    default:
      throw new Error("Unknown action type");
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tempToken, setTempToken] = useState(null); // <-- tempToken for reset flow

  const navigate = useNavigate();

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/v1/me", {
          withCredentials: true,
        });
        dispatch({ type: "AUTH_SUCCESS", payload: response.data });
        // eslint-disable-next-line no-unused-vars
      } catch (err) {
        dispatch({ type: "LOGOUT" });
      }
    };
    checkAuth();
  }, []);

  // Register
  const register = async (name, email, password, role) => {
    dispatch({ type: "REGISTER_START" });
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/register",
        {
          name,
          email,
          password,
          role,
        }
      );
      dispatch({ type: "AUTH_SUCCESS", payload: response.data });
    } catch (err) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Registration failed",
      });
      throw err;
    }
  };

  // Login
  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/login",
        { email, password },
        { withCredentials: true }
      );
      dispatch({ type: "AUTH_SUCCESS", payload: response.data });
      navigate("/");
    } catch (err) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Login failed",
      });
      throw err;
    }
  };

  // Forgot Password (Step 1)
  const forgotPassword = async (email) => {
    dispatch({ type: "FORGOT_PASSWORD_START" });
    try {
      await axios.put("http://localhost:5000/api/v1/forgotPassword", { email });
      dispatch({ type: "FORGOT_PASSWORD_SUCCESS" });
      return true; // Success
    } catch (err) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Failed to send OTP",
      });
      throw err;
    }
  };

  // Verify OTP (Step 2)
  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/v1/verify-otp",
        {
          email,
          otp,
        }
      );
      setTempToken(response.data.token); // <-- Save the tempToken here
      return true;
    } catch (err) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Invalid OTP",
      });
      throw err;
    }
  };

  const resetPassword = async (newPassword) => {
    try {
      await axios.put(
        "http://localhost:5000/api/v1/reset-password",
        { newPassword },
        { withCredentials: true } // You may or may not need this depending on your auth setup
      );

      // ✅ CLEAR existing auth cookies/state
      document.cookie = "token=; Max-Age=0"; // clear token cookie
      localStorage.removeItem("user"); // or however you store user data
      dispatch({ type: "LOGOUT" }); // if you're using a context/reducer

      // ✅ Redirect to login screen
      navigate("/login");
      alert("Password reset successful. Please log in again.");
    } catch (err) {
      console.error("Reset failed", err);
      alert("Reset failed");
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/v1/logout",
        {},
        { withCredentials: true }
      );
    } finally {
      dispatch({ type: "LOGOUT" });
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        forgotPassword,
        verifyOTP,
        resetPassword,
        tempToken, // <-- exposed for use elsewhere if needed eltemp token elbteegi after eluser ydakhal correct otp
        setTempToken, // <-- exposed in case you want to clear manually
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

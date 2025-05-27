// src/context/AuthContext.jsx
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  useCallback,
} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  mfaRequired: false,
  mfaEmail: null,
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Configure axios defaults
axios.defaults.withCredentials = true;

function reducer(state, action) {
  switch (action.type) {
    case "LOGIN_START":
    case "REGISTER_START":
    case "FORGOT_PASSWORD_START":
    case "REFRESH_START":
      return { ...state, isLoading: true, error: null };
    case "AUTH_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "AUTH_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        error: action.payload,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "FORGOT_PASSWORD_SUCCESS":
      return { ...state, isLoading: false, error: null };
    case "MFA_REQUIRED":
      return {
        ...state,
        mfaRequired: true,
        mfaEmail: action.payload.email,
        isLoading: false,
      };
    case "MFA_RESET":
      return {
        ...state,
        mfaRequired: false,
        mfaEmail: null,
      };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tempToken, setTempToken] = useState(null);
  const [resetEmail, setResetEmail] = useState(null);
  const navigate = useNavigate();

  const refreshProfile = useCallback(async () => {
    try {
      dispatch({ type: "REFRESH_START" });
      const response = await axios.get(`${API_BASE_URL}/api/v1/users/profile`, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.success) {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.data });
      } else {
        throw new Error(response.data.message || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile refresh error:", error);
      dispatch({
        type: "AUTH_FAILURE",
        payload: error.response?.data?.message || "Failed to refresh profile",
      });
    }
  }, [dispatch]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        dispatch({ type: "LOGIN_START" });
        const response = await axios.get(
          `${API_BASE_URL}/api/v1/users/profile`,
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          }
        );

        if (response.data.success) {
          dispatch({ type: "AUTH_SUCCESS", payload: response.data.data });
        } else {
          throw new Error(response.data.message || "Failed to fetch profile");
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        dispatch({
          type: "AUTH_FAILURE",
          payload: error.response?.data?.message || "Failed to fetch profile",
        });
      }
    };
    checkAuth();
  }, []);

  const register = async (name, email, password, role) => {
    dispatch({ type: "REGISTER_START" });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/register`,
        { name, email, password, role },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.data.success) {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.data });
      } else {
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (err) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Registration failed",
      });
      throw err;
    }
  };

  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/login`,
        { email, password }
      );

      if (response.data.mfaRequired) {
        dispatch({
          type: "MFA_REQUIRED",
          payload: { email },
        });
        return;
      }

      if (response.data.success) {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.data });
      } else {
        throw new Error(response.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Login failed",
      });
      throw err;
    }
  };

  const forgotPassword = async (email) => {
    dispatch({ type: "FORGOT_PASSWORD_START" });
    try {
      await axios.put(`${API_BASE_URL}/api/v1/forgotPassword`, { email });
      setResetEmail(email);
      dispatch({ type: "FORGOT_PASSWORD_SUCCESS" });
      return true;
    } catch (err) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Failed to send OTP",
      });
      throw err;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/verify-otp`, {
        email,
        otp,
      });
      setTempToken(response.data.token);
      return true;
    } catch (err) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Invalid OTP",
      });
      throw err;
    }
  };

  const resetPassword = async (email, newPassword) => {
    dispatch({ type: "FORGOT_PASSWORD_START" });
    try {
      const response = await axios.put(
        `${API_BASE_URL}/api/v1/reset-password`,
        { newPassword },
        {
          headers: { Authorization: `Bearer ${tempToken}` },
        }
      );

      setTempToken(null);

      if (resetEmail) {
        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          await login(resetEmail, newPassword);
        } catch (loginError) {
          console.error("Auto-login after reset failed:", loginError);
        }
      }

      dispatch({ type: "FORGOT_PASSWORD_SUCCESS" });
      return response.data;
    } catch (err) {
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "Reset failed",
      });
      throw err;
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/logout`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      dispatch({ type: "LOGOUT" });
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate("/login");
    } catch (err) {
      dispatch({ type: "LOGOUT" });
      document.cookie =
        "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      navigate("/login");
    }
  };

  const validateMFA = async (email, token) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/mfa/validate`,
        { email, token }
      );

      if (response.data.success) {
        dispatch({ type: "AUTH_SUCCESS", payload: response.data.data });
        dispatch({ type: "MFA_RESET" });
        return response.data;
      } else {
        throw new Error(response.data.message || "MFA validation failed");
      }
    } catch (err) {
      console.error("MFA validation error:", err);
      dispatch({
        type: "AUTH_FAILURE",
        payload: err.response?.data?.message || "MFA validation failed",
      });
      throw err;
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
        tempToken,
        setTempToken,
        resetEmail,
        setResetEmail,
        validateMFA,
        refreshProfile,
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

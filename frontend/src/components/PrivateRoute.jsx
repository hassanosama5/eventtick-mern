import { useAuth } from "../context/AuthContext";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Loader from "./Loader";

export default function PrivateRoute({ allowedRoles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <Loader size={60} />;
  }

  if (!isAuthenticated) {
    // Redirect to login but save the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required, allow access
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Check if user's role is allowed
  if (allowedRoles.includes(user?.role)) {
    return <Outlet />;
  }

  // If user's role is not allowed, redirect to unauthorized page
  return <Navigate to="/unauthorized" replace />;
}

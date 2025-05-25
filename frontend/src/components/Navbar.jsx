import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css"; // Create this file for navbar styles

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-spacer" />
        <Link to="/" className="nav-brand">
          EventTick
        </Link>
        <div className="nav-links">
          {user ? (
            <>
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

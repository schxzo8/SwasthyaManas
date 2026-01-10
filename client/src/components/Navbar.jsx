import { Link, useNavigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";
import "../styles/navbar.css";

function Navbar() {
  const loggedIn = isLoggedIn();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <h2>SwasthyaManas</h2>
      </div>

      <div className="nav-right">
        <Link to="/">Home</Link>
        <Link to="/content">Resources</Link>

        {!loggedIn && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}

        {loggedIn && (
          <button onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        The Clothesline <span>poems &amp; thoughts</span>
      </Link>
      <div className="navbar__links">
        {user ? (
          <>
            <Link to="/favorites" className="btn btn--ghost">
              ♡ Favorites
            </Link>
            <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{user.username}</span>
            <Link to="/submit" className="btn btn--primary">
              Hang up a poem
            </Link>
            <button className="btn btn--ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn--ghost">
              Log in
            </Link>
            <Link to="/register" className="btn btn--primary">
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

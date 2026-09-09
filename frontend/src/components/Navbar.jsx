import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__brand">
        The CommentSection <span>poems &amp; thoughts</span>
      </Link>
      <div className="navbar__links">
        {user ? (
          <>
            <Link to="/account" className="navbar__user">
              <span className="navbar__user-avatar">{user.username[0]?.toUpperCase()}</span>
              {user.username}
            </Link>
            <Link to="/submit" className="btn btn--primary">
              Hang up a poem
            </Link>
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

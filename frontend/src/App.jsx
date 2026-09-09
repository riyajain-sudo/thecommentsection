import { Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import FloatingBlobs from "./components/FloatingBlobs";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Submit from "./pages/Submit";
import PoemPage from "./pages/PoemPage";
import EditPoem from "./pages/EditPoem";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Account from "./pages/Account";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <AuthProvider>
      <FloatingBlobs />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/poems/:id" element={<PoemPage />} />
          <Route path="/u/:username" element={<Profile />} />
          <Route
            path="/submit"
            element={
              <ProtectedRoute>
                <Submit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/poems/:id/edit"
            element={
              <ProtectedRoute>
                <EditPoem />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="state-block">
                <h3>Nothing hanging here</h3>
                <p>That page doesn't exist.</p>
              </div>
            }
          />
        </Routes>
      </main>
      <footer className="footer">
        The CommentSection — a small, quiet space for words.
      </footer>
    </AuthProvider>
  );
}

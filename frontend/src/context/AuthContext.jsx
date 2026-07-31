import { createContext, useContext, useEffect, useState } from "react";
import {
  clearToken,
  fetchMe,
  getToken,
  loginAccount,
  registerAccount,
  setToken,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }
    fetchMe()
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await loginAccount({ email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (username, email, password) => {
    const data = await registerAccount({ username, email, password });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

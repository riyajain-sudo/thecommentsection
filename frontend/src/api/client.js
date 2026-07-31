import axios from "axios";

const TOKEN_KEY = "clothesline_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ---- Auth ----
export const registerAccount = (payload) =>
  api.post("/auth/register", payload).then((res) => res.data);

export const loginAccount = (payload) =>
  api.post("/auth/login", payload).then((res) => res.data);

export const fetchMe = () => api.get("/auth/me").then((res) => res.data);

// ---- Poems ----
export const fetchPoems = ({ search = "", tag = "", sort = "new", page = 1 } = {}) =>
  api
    .get("/poems", { params: { search, tag, sort, page } })
    .then((res) => res.data);

export const fetchMyPoems = ({ page = 1 } = {}) =>
  api.get("/poems/mine", { params: { page } }).then((res) => res.data);

export const fetchFavorites = ({ page = 1 } = {}) =>
  api.get("/poems/favorites", { params: { page } }).then((res) => res.data);

export const fetchPoem = (id) => api.get(`/poems/${id}`).then((res) => res.data);

export const createPoem = (payload) =>
  api.post("/poems", payload).then((res) => res.data);

export const likePoem = (id) => api.post(`/poems/${id}/like`).then((res) => res.data);

export const deletePoem = (id) => api.delete(`/poems/${id}`).then((res) => res.data);

export default api;

// src/pages/LoginPage.jsx
// src/pages/LoginPage.jsx
import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../services/authContext.jsx";
import api from "../services/api.js";
const bg = "/silksong.jpg";

export default function LoginPage() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      navigate(location.pathname, { replace: true });
    }

    api
      .get("/user/profile")
      .then((res) => {
        const user = res.data?.data;
        if (user) navigate("/chat");
      })
      .catch(() => {});
  }, [navigate, location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim()) {
      setError("Email is required");
      setLoading(false);
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      setLoading(false);
      return;
    }

    try {
      const loginResponse = await api.post("/auth/login", { email, password });
      if (loginResponse.data?.success) {
        setUser(loginResponse.data.data.loggedInUser);
        localStorage.setItem("accessToken", loginResponse.data.data.accessToken);
        navigate("/chat");
      } else {
        setError(loginResponse.data?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.data?.message) setError(err.response.data.message);
      else if (err.response?.status === 401) setError("Invalid email or password");
      else setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-cover relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* darker overlay for contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/20 to-black/10" />

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* card: dark translucent panel */}
        <div className="rounded-2xl p-8 shadow-xl border border-white/6 bg-black/55">
          <h1 className="text-2xl mb-4 text-white font-semibold text-center">Welcome back</h1>

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-900/40 border border-emerald-200/10 text-emerald-100 rounded">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-900/40 border border-red-300/10 text-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input
              aria-label="Email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 placeholder-gray-300 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />

            <input
              aria-label="Password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 placeholder-gray-300 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-60 transition-colors"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/register")}
              className="text-emerald-200 hover:text-white underline"
            >
              Don&apos;t have an account? Register
            </button>
          </div>
        </div>

        <p className="text-xs text-white/60 mt-4 text-center">
          Ping — <a className="underline" href="https://ping-v1.vercel.app" target="_blank" rel="noreferrer">ping-v1.vercel.app</a>
        </p>
      </div>
    </div>
  );
}

// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
const bg = "/silksong.jpg";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim()) { setError("Email is required"); setLoading(false); return; }
    if (!username.trim()) { setError("Username is required"); setLoading(false); return; }
    if (!password.trim()) { setError("Password is required"); setLoading(false); return; }
    if (!confirmPassword.trim()) { setError("Please confirm your password"); setLoading(false); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); setLoading(false); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters long"); setLoading(false); return; }
    if (username.length < 3) { setError("Username must be at least 3 characters long"); setLoading(false); return; }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError("Please enter a valid email address"); setLoading(false); return; }
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) { setError("Username can only contain letters, numbers, and underscores"); setLoading(false); return; }

    try {
      const response = await api.post("/auth/register", { email, username, password });
      if (response.data?.success) {
        navigate("/", { state: { message: "Registration successful! Please login with your credentials." }});
      } else {
        setError(response.data?.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      if (err.response?.data?.message) {
        const msg = err.response.data.message.toLowerCase();
        if (msg.includes("username")) setError("Username already exists. Please choose a different username.");
        else if (msg.includes("email")) setError("Email already exists. Please use a different email address.");
        else setError(err.response.data.message);
      } else if (err.response?.status === 409) setError("Username or email already exists");
      else setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-center bg-cover relative"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/60 to-black/50" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-2xl p-8 shadow-xl border border-white/6 bg-black/55">
          <h1 className="text-2xl mb-4 text-white font-semibold text-center">Create Account</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-900/40 border border-red-300/10 text-red-100 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <input aria-label="Email" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 placeholder-gray-300 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
            <div>
              <input aria-label="Username" type="text" placeholder="Username (3+ characters)" value={username} onChange={e => setUsername(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/40 placeholder-gray-300 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
              <p className="text-xs text-white/60 mt-1">Only letters, numbers, and underscores allowed</p>
            </div>
            <input aria-label="Password" type="password" placeholder="Password (6+ characters)" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 placeholder-gray-300 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />
            <input aria-label="Confirm Password" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 placeholder-gray-300 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400/60" />

            <button disabled={loading} className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium disabled:opacity-60 transition-colors">
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => navigate("/")} className="text-emerald-200 hover:text-white underline">
              Already have an account? Login
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

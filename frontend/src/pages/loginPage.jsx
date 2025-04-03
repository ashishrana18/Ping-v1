import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../services/authContext.jsx";
import api from "../services/api.js";

function LoginPage() {
  const { setUser } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loginResponse = await api.post("/auth/login", {
        email,
        password
      });
      console.log("Login response:", loginResponse.data.data);
      if (loginResponse.data.success) {
        setUser(loginResponse.data.data.loggedInUser);
        navigate("/chat");
      }
    } catch (error) {
      console.error("Login error:", error.response.data);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="p-2 border rounded dark:bg-slate-800"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 dark:bg-info text-white p-2 rounded"
        >
          Login
        </button>
      </form>
      <button onClick={() => navigate("/register")} className="mt-4 underline">
        Register
      </button>
    </div>
  );
}

export default LoginPage;

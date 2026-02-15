import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (email === "admin@company.com" && password === "admin123") {
      localStorage.setItem("loggedIn", "true");
      onLogin();               // 🔥 THIS triggers re-render
      navigate("/dashboard");  // 🔥 This changes route
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 p-8 rounded-xl w-96 shadow-lg"
      >
        <h2 className="text-2xl text-white mb-6 font-bold text-center">
          Aluminium ERP Login
        </h2>

        <input
          className="w-full mb-4 p-3 rounded bg-slate-700 text-white outline-none"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          className="w-full mb-6 p-3 rounded bg-slate-700 text-white outline-none"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 transition py-3 rounded text-white font-semibold"
        >
          Login
        </button>
      </form>
    </div>
  );
}

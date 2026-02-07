import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

import bgPattern from "../assets/bg-pattern.jpg";
import pulseLogo from "../assets/pulse-logo.png";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", form);
      setMsg(res.data.message || "Registered successfully!");
      navigate("/login");
    } catch (err) {
      setMsg(err.response?.data?.message || "Register failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${bgPattern})`,
          backgroundRepeat: "repeat",
          backgroundSize: "700px",
          backgroundPosition: "top left",
          opacity: 1
        }}
      />

      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-pulse-navy/95 p-6 text-white shadow-lg">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl">
              <img
                src={pulseLogo}
                alt="Pulse Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold">PulseAI</h1>
              <p className="text-xs text-white/70">
                Track calories • macros • lifestyle
              </p>
            </div>
          </div>

          <h2 className="mt-6 text-2xl font-bold">Register</h2>
          <p className="text-sm text-white/70">
            Create an account to start tracking.
          </p>
        </div>

        {msg && (
          <div className="mb-4 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm text-white/90">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-white/80">
              Name
            </label>
            <input
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/80">
              Email
            </label>
            <input
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/80">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-pulse-navy transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="mt-5 text-sm text-white/70">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-white hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

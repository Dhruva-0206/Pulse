import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

import confetti1 from "../assets/confetti/leaf1.png";
import confetti2 from "../assets/confetti/leaf2.png";

import bgPattern from "../assets/bg-pattern.jpg";
import pulseLogo from "../assets/pulse-logo.png";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const cursorPos = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });

  const [cursorBurst, setCursorBurst] = useState(false);
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const handleMove = (e) => {
      cursorPos.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const spawnConfetti = () => {
    const { x, y } = cursorPos.current;

    const pieces = Array.from({ length: 35 }).map((_, i) => {
      const img = Math.random() > 0.5 ? confetti1 : confetti2;

      return {
        id: `${Date.now()}-${i}`,
        img,
        startX: x,
        startY: y,
        driftX: Math.random() * 440 - 220,
        launchY: -(120 + Math.random() * 220),
        rotate: Math.random() * 720,
        size: 22 + Math.random() * 18,
        duration: 2600 + Math.random() * 1600,
        delay: Math.random() * 120,
        wobble: Math.random() * 120 - 60
      };
    });

    setConfetti(pieces);
    setTimeout(() => setConfetti([]), 4500);
  };

  const playSuccessAnimation = () => {
    setCursorBurst(true);
    spawnConfetti();
    setTimeout(() => setCursorBurst(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      playSuccessAnimation();

      setTimeout(() => {
        navigate("/dashboard");
      }, 2200);
    } catch (err) {
      setMsg(err.response?.data?.message || "Login failed");
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

      {cursorBurst && (
        <div
          className="pointer-events-none fixed z-[9999] pulse-cursor-burst"
          style={{
            left: cursorPos.current.x,
            top: cursorPos.current.y,
            transform: "translate(-50%, -50%)"
          }}
        >
          <div className="h-12 w-12 rounded-full border-2 border-white/60 bg-white/20 backdrop-blur-sm" />
        </div>
      )}

      <div className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden">
        {confetti.map((c) => (
          <img
            key={c.id}
            src={c.img}
            alt="confetti"
            className="absolute"
            style={{
              left: c.startX,
              top: c.startY,
              width: c.size,
              height: c.size,
              transform: `translate(-50%, -50%) rotate(${c.rotate}deg)`,
              animation: `pulse-confetti-fall ${c.duration}ms cubic-bezier(0.15, 0.9, 0.2, 1) ${c.delay}ms forwards`,
              "--driftX": `${c.driftX}px`,
              "--launchY": `${c.launchY}px`,
              "--wobble": `${c.wobble}px`
            }}
          />
        ))}
      </div>

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

          <h2 className="mt-6 text-2xl font-bold">Login</h2>
          <p className="text-sm text-white/70">
            Welcome back. Continue tracking your nutrition.
          </p>
        </div>

        {msg && (
          <div className="mb-4 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-white/90">
              Email
            </label>
            <input
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-white/90">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-pulse-navy transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-sm text-white/80">
          New user?{" "}
          <Link to="/register" className="font-semibold text-white underline">
            Register
          </Link>
        </p>
      </div>

      <style>
        {`
          .pulse-cursor-burst {
            animation: pulseCursorBurst 600ms ease-out forwards;
          }

          @keyframes pulseCursorBurst {
            0% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            15% { transform: translate(-50%, -50%) scale(0.55); opacity: 1; }
            55% { transform: translate(-50%, -50%) scale(1.8); opacity: 0.9; }
            100% { transform: translate(-50%, -50%) scale(1.1); opacity: 0; }
          }

          @keyframes pulse-confetti-fall {
            0% {
              opacity: 1;
              transform: translate(-50%, -50%) translateX(0px) translateY(0px) rotate(0deg);
            }
            30% {
              transform: translate(-50%, -50%)
                translateX(calc(var(--driftX) * 0.35))
                translateY(var(--launchY))
                rotate(180deg);
            }
            70% {
              transform: translate(-50%, -50%)
                translateX(calc(var(--driftX) * 0.75 + var(--wobble)))
                translateY(520px)
                rotate(520deg);
            }
            100% {
              opacity: 0;
              transform: translate(-50%, -50%)
                translateX(var(--driftX))
                translateY(900px)
                rotate(720deg);
            }
          }
        `}
      </style>
    </div>
  );
}

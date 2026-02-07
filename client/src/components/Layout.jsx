import { Link, useLocation, useNavigate } from "react-router-dom";
import bgPattern from "../assets/bg-pattern.jpg";
import pulseLogo from "../assets/pulse-logo.png";
import pulseAiNormal from "../assets/pulseai-normal.png";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const navLinks = [
    { label: "PulseAI", to: "/pulseai" },
    { label: "Dashboard", to: "/dashboard" },
    { label: "Add Food", to: "/add-food" },
    { label: "History", to: "/history" },
    { label: "Profile", to: "/profile" }
  ];

  const isPulseAiPage = location.pathname === "/pulseai";

  return (
    <div className="relative min-h-screen flex flex-col text-pulse-navy">
      {!isPulseAiPage && (
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
      )}

      <header className="sticky top-0 z-50 border-b border-black/10 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl">
              <img
                src={pulseLogo}
                alt="Pulse Logo"
                className="h-full w-full object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight text-pulse-navy">
                Pulse
              </h1>
              <p className="text-xs text-pulse-navy/70">
                Track calories • macros • lifestyle
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {token && (
              <>
                {navLinks.map((item) => {
                  const active = location.pathname === item.to;
                  const isPulseAi = item.to === "/pulseai";

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      className={
                        "relative rounded-lg px-3 py-2 text-sm font-medium transition " +
                        (active
                          ? "bg-pulse-navy text-white"
                          : "text-pulse-navy hover:bg-pulse-blue/40")
                      }
                    >
                      {isPulseAi && (
                        <img
                          src={pulseAiNormal}
                          alt=""
                          className="pointer-events-none absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2 opacity-70 z-0"
                        />
                      )}

                      <span
                        className={
                          "relative z-10 " + (isPulseAi ? "pl-7" : "")
                        }
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}

                <button
                  onClick={logout}
                  className="ml-2 rounded-lg bg-pulse-red px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Logout
                </button>
              </>
            )}

            {!token && (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-pulse-navy transition hover:bg-pulse-blue/40"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-pulse-navy px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                >
                  Register
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main
        className={
          isPulseAiPage
            ? "w-full flex-1"
            : "mx-auto w-full max-w-6xl flex-1 px-4 py-8"
        }
      >
        {children}
      </main>

      {!isPulseAiPage && (
        <footer className="mt-auto border-t border-black/10 bg-cream">
          <div className="mx-auto max-w-6xl px-4 py-4 text-xs text-pulse-navy/70">
            © {new Date().getFullYear()} PulseAI • Built with React + Node +
            PostgreSQL
          </div>
        </footer>
      )}
    </div>
  );
}

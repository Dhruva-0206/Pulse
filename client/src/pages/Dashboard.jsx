import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const API = "http://localhost:5000/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [targets, setTargets] = useState(null);
  const [today, setToday] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  const loadData = async () => {
    try {
      setLoading(true);
      setMsg("");

      const [tRes, todayRes] = await Promise.all([
        fetch(`${API}/nutrition/targets`, { headers }),
        fetch(`${API}/logs/today`, { headers })
      ]);

      if (tRes.status === 404) {
        navigate("/profile?setup=1");
        return;
      }

      if (!tRes.ok) {
        throw new Error("Failed to load nutrition targets");
      }

      if (!todayRes.ok) {
        throw new Error("Today logs fetch failed");
      }

      const tData = await tRes.json();
      const todayData = await todayRes.json();

      setTargets(tData);
      setToday(todayData);
    } catch (err) {
      console.error(err);
      setMsg("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const deleteLog = async (id) => {
    try {
      setMsg("");

      const res = await fetch(`${API}/logs/${id}`, {
        method: "DELETE",
        headers
      });

      if (!res.ok) {
        throw new Error("Delete failed");
      }

      await loadData();
    } catch (err) {
      console.error(err);
      setMsg("Error deleting log");
    }
  };

  const t = targets?.targets || targets || null;

  const sum = today?.totals || {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0
  };

  const caloriePct = percent(sum.calories, t?.target_calories);
  const proteinPct = percent(sum.protein_g, t?.macros?.protein_g);
  const carbsPct = percent(sum.carbs_g, t?.macros?.carbs_g);
  const fatPct = percent(sum.fat_g, t?.macros?.fat_g);

  return (
    <Layout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-pulse-navy">Dashboard</h2>
          <p className="text-sm text-pulse-navy/70">
            Track your calories and macros for today
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/add-food"
            className="rounded-xl bg-pulse-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            + Add Food
          </Link>

          <Link
            to="/tracking"
            className="rounded-xl bg-pulse-blue/35 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:bg-pulse-blue/50"
          >
            Detailed Tracking
          </Link>

          <Link
            to="/history"
            className="rounded-xl bg-pulse-blue/35 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:bg-pulse-blue/50"
          >
            History
          </Link>

          <button
            onClick={loadData}
            className="rounded-xl bg-pulse-blue/35 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:bg-pulse-blue/50"
          >
            Refresh
          </button>

          <button
            onClick={logout}
            className="rounded-xl bg-pulse-red/15 px-4 py-2 text-sm font-semibold text-pulse-red transition hover:bg-pulse-red/25"
          >
            Logout
          </button>
        </div>
      </div>

      {msg && (
        <div className="mt-4 rounded-xl border border-pulse-red/30 bg-pulse-red/10 px-4 py-3 text-sm text-pulse-red">
          {msg}
        </div>
      )}

      {loading ? (
        <div className="mt-6 text-sm text-pulse-navy/70">Loading...</div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card
              title="Your Targets"
              subtitle="Calculated from your profile"
              className="bg-pulse-blue/85"
            >
              {!t ? (
                <p className="text-sm text-pulse-navy/70">
                  No targets found. Create your profile first.
                </p>
              ) : (
                <div className="space-y-3 text-sm">
                  <Row label="BMR" value={`${t?.bmr ?? 0} kcal`} />
                  <Row label="TDEE" value={`${t?.tdee ?? 0} kcal`} />
                  <Row
                    label="Target Calories"
                    value={`${t?.target_calories ?? 0} kcal`}
                  />

                  <div className="pt-2">
                    <div className="text-xs font-semibold uppercase text-pulse-navy/70">
                      Macros / day
                    </div>

                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <MiniStat
                        label="Protein"
                        value={`${t?.macros?.protein_g ?? 0}g`}
                      />
                      <MiniStat
                        label="Carbs"
                        value={`${t?.macros?.carbs_g ?? 0}g`}
                      />
                      <MiniStat
                        label="Fat"
                        value={`${t?.macros?.fat_g ?? 0}g`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            <Card
              title="Today Summary"
              subtitle="Your intake so far"
              className="bg-pulse-green/85"
            >
              {!today ? (
                <p className="text-sm text-pulse-navy/70">
                  No data for today.
                </p>
              ) : (
                <div className="space-y-4">
                  <ProgressLine
                    label="Calories"
                    current={sum.calories}
                    target={t?.target_calories || 0}
                    suffix="kcal"
                    pct={caloriePct}
                    barColor="bg-pulse-yellow/85"
                  />

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <ProgressLine
                      label="Protein"
                      current={sum.protein_g}
                      target={t?.macros?.protein_g || 0}
                      suffix="g"
                      pct={proteinPct}
                      compact
                      barColor="bg-pulse-navy"
                    />

                    <ProgressLine
                      label="Carbs"
                      current={sum.carbs_g}
                      target={t?.macros?.carbs_g || 0}
                      suffix="g"
                      pct={carbsPct}
                      compact
                      barColor="bg-pulse-blue"
                    />

                    <ProgressLine
                      label="Fat"
                      current={sum.fat_g}
                      target={t?.macros?.fat_g || 0}
                      suffix="g"
                      pct={fatPct}
                      compact
                      barColor="bg-pulse-red"
                    />
                  </div>

                  <div className="text-xs text-pulse-navy/70">
                    Fiber today:{" "}
                    <b className="text-pulse-navy">
                      {sum.fiber_g ?? 0}g
                    </b>
                  </div>
                </div>
              )}
            </Card>
          </div>

          <div className="mt-6 rounded-2xl border border-black/10 bg-pulse-yellow/85 p-6 shadow-sm">
            <div className="mt-4 space-y-3">
              {today?.logs?.length ? (
                today.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-white/55 p-4 shadow-sm"
                  >
                    <div>
                      <div className="font-semibold text-pulse-navy">
                        {log.food?.name || "Food"}
                      </div>

                      <div className="text-sm text-pulse-navy/70">
                        {log.quantity_g}g →{" "}
                        <b className="text-pulse-navy">
                          {log.calculated?.calories || 0} kcal
                        </b>
                      </div>

                      <div className="mt-1 text-xs text-pulse-navy/70">
                        P {log.calculated?.protein_g || 0}g • C{" "}
                        {log.calculated?.carbs_g || 0}g • F{" "}
                        {log.calculated?.fat_g || 0}g
                      </div>
                    </div>

                    <button
                      onClick={() => deleteLog(log.id)}
                      className="rounded-xl bg-pulse-red/15 px-3 py-2 text-sm font-semibold text-pulse-red transition hover:bg-pulse-red/25"
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-sm text-pulse-navy/70">
                  No logs today. Add your first food 🚀
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

function Card({ title, subtitle, children, className = "" }) {
  return (
    <div
      className={
        "rounded-2xl border border-black/10 p-6 shadow-sm " + className
      }
    >
      <div className="mb-4">
        <h3 className="text-lg font-bold text-pulse-navy">{title}</h3>
        {subtitle && (
          <p className="text-sm text-pulse-navy/70">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-pulse-navy/70">{label}</div>
      <div className="font-semibold text-pulse-navy">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl border border-black/10 bg-white/70 px-3 py-2">
      <div className="text-xs text-pulse-navy/70">{label}</div>
      <div className="text-sm font-bold text-pulse-navy">{value}</div>
    </div>
  );
}

function ProgressLine({
  label,
  current,
  target,
  suffix,
  pct,
  compact = false,
  barColor = "bg-pulse-navy"
}) {
  const safeTarget = Number(target || 0);
  const safeCurrent = Number(current || 0);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <div className="font-semibold text-pulse-navy">{label}</div>
        <div className="text-pulse-navy/70">
          {safeCurrent} / {safeTarget} {suffix}
        </div>
      </div>

      <div
        className={`mt-2 w-full rounded-full border border-black/10 bg-white/60 ${
          compact ? "h-2" : "h-3"
        }`}
      >
        <div
          className={`h-full rounded-full ${barColor} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-1 text-xs text-pulse-navy/70">{pct}%</div>
    </div>
  );
}

function percent(current, target) {
  const c = Number(current || 0);
  const t = Number(target || 0);
  if (!t) return 0;
  const p = Math.round((c / t) * 100);
  return Math.max(0, Math.min(100, p));
}

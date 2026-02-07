import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

const API = "http://localhost:5000/api";

export default function Tracking() {
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
        fetch(`${API}/logs/today-detailed`, { headers })
      ]);

      if (!tRes.ok) {
        navigate("/profile?setup=1");
        return;
      }

      if (!todayRes.ok) {
        throw new Error("Today detailed logs fetch failed");
      }

      const tData = await tRes.json();
      const todayData = await todayRes.json();

      setTargets(tData);
      setToday(todayData);
    } catch (err) {
      console.error(err);
      setMsg("Error loading tracking data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const t = targets?.targets || targets || null;

  const sum = today?.totals || {
    calories: 0,
    protein_g: 0,
    carbs_g: 0,
    fat_g: 0,
    fiber_g: 0
  };

  const microsToday = today?.micros || {
    sodium_mg: 0,
    potassium_mg: 0,
    calcium_mg: 0,
    iron_mg: 0,
    magnesium_mg: 0,
    zinc_mg: 0,
    vitamin_a_mcg: 0,
    vitamin_c_mg: 0,
    vitamin_d_iu: 0,
    vitamin_b12_mcg: 0,
    folate_mcg: 0
  };

  const microGoals = {
    sodium_mg: 2300,
    potassium_mg: 3500,
    calcium_mg: 1000,
    iron_mg: 18,
    magnesium_mg: 400,
    zinc_mg: 11,
    vitamin_a_mcg: 900,
    vitamin_c_mg: 90,
    vitamin_d_iu: 600,
    vitamin_b12_mcg: 2.4,
    folate_mcg: 400
  };

  const caloriePct = percent(sum.calories, t?.target_calories);
  const proteinPct = percent(sum.protein_g, t?.macros?.protein_g);
  const carbsPct = percent(sum.carbs_g, t?.macros?.carbs_g);
  const fatPct = percent(sum.fat_g, t?.macros?.fat_g);

  const fiberTarget = 30;
  const fiberPct = percent(sum.fiber_g, fiberTarget);

  return (
    <Layout>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-pulse-navy">
            Detailed Tracking
          </h2>
          <p className="text-sm text-pulse-navy/70">
            Macros + micronutrients progress for today
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/dashboard"
            className="rounded-xl bg-pulse-blue/35 px-4 py-2 text-sm font-semibold text-pulse-navy hover:bg-pulse-blue/50_job transition"
          >
            ← Back to Dashboard
          </Link>

          <button
            onClick={loadData}
            className="rounded-xl bg-pulse-blue/35 px-4 py-2 text-sm font-semibold text-pulse-navy hover:bg-pulse-blue/50 transition"
          >
            Refresh
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
          <div className="mt-6 rounded-2xl border border-black/10 bg-pulse-green/85 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-pulse-navy">Today Macros</h3>
            <p className="text-sm text-pulse-navy/70">
              Your progress against daily targets
            </p>

            <div className="mt-5 space-y-4">
              <ProgressLine
                label="Calories"
                current={sum.calories}
                target={t?.target_calories || 0}
                suffix="kcal"
                pct={caloriePct}
                barColor="bg-pulse-yellow/85"
              />

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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

                <ProgressLine
                  label="Fiber"
                  current={sum.fiber_g}
                  target={fiberTarget}
                  suffix="g"
                  pct={fiberPct}
                  compact
                  barColor="bg-pulse-green"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-black/10 bg-pulse-blue/85 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-pulse-navy">
              Vitamins & Minerals
            </h3>
            <p className="text-sm text-pulse-navy/70">
              Default recommended goals (will be personalized later)
            </p>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              <MicroBar label="Sodium" current={microsToday.sodium_mg} target={microGoals.sodium_mg} suffix="mg" />
              <MicroBar label="Potassium" current={microsToday.potassium_mg} target={microGoals.potassium_mg} suffix="mg" />
              <MicroBar label="Calcium" current={microsToday.calcium_mg} target={microGoals.calcium_mg} suffix="mg" />
              <MicroBar label="Iron" current={microsToday.iron_mg} target={microGoals.iron_mg} suffix="mg" />
              <MicroBar label="Magnesium" current={microsToday.magnesium_mg} target={microGoals.magnesium_mg} suffix="mg" />
              <MicroBar label="Zinc" current={microsToday.zinc_mg} target={microGoals.zinc_mg} suffix="mg" />
              <MicroBar label="Vitamin A" current={microsToday.vitamin_a_mcg} target={microGoals.vitamin_a_mcg} suffix="mcg" />
              <MicroBar label="Vitamin C" current={microsToday.vitamin_c_mg} target={microGoals.vitamin_c_mg} suffix="mg" />
              <MicroBar label="Vitamin D" current={microsToday.vitamin_d_iu} target={microGoals.vitamin_d_iu} suffix="IU" />
              <MicroBar label="Vitamin B12" current={microsToday.vitamin_b12_mcg} target={microGoals.vitamin_b12_mcg} suffix="mcg" />
              <MicroBar label="Folate" current={microsToday.folate_mcg} target={microGoals.folate_mcg} suffix="mcg" />
            </div>

            <div className="mt-4 text-xs text-pulse-navy/70">
              Note: Micronutrient totals update from USDA foods logged today.
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}

function MicroBar({ label, current, target, suffix }) {
  const pct = percent(current, target);

  return (
    <div className="rounded-xl border border-black/10 bg-white/55 p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <div className="font-semibold text-pulse-navy">{label}</div>
        <div className="text-pulse-navy/70">
          {formatNumber(current)} / {formatNumber(target)} {suffix}
        </div>
      </div>

      <div className="mt-2 h-2 w-full rounded-full border border-black/10 bg-white/60">
        <div
          className="h-full rounded-full bg-pulse-navy transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-1 text-xs text-pulse-navy/70">{pct}%</div>
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

function formatNumber(n) {
  const num = Number(n || 0);
  return num % 1 !== 0 ? num.toFixed(1) : Math.round(num);
}

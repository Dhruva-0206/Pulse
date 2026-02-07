import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";

export default function History() {
  const token = localStorage.getItem("token");

  const todayISO = useMemo(
    () => new Date().toISOString().slice(0, 10),
    []
  );

  const [date, setDate] = useState(todayISO);
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchHistory = async (selectedDate) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `http://localhost:5000/api/logs/by-date?date=${selectedDate}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json?.message || "Error loading history");
        setData(null);
        return;
      }

      setData(json);
    } catch (err) {
      setError("Error loading history");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-6">
        <h1 className="mb-2 text-3xl font-bold text-pulse-navy">History</h1>
        <p className="mb-6 text-sm text-pulse-navy/70">
          View all foods logged on a particular day.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-pulse-red/30 bg-pulse-red/10 px-4 py-3 text-sm text-pulse-red">
            {error}
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <label className="text-sm font-semibold text-pulse-navy">
            Select Date
          </label>

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-black/10 bg-pulse-navy/10 px-3 py-2 text-sm text-pulse-navy outline-none focus:ring-2 focus:ring-pulse-navy/20"
          />

          <button
            onClick={() => fetchHistory(date)}
            className="rounded-xl border border-black/10 bg-pulse-navy/10 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:bg-pulse-navy/15"
          >
            Refresh
          </button>
        </div>

        {loading && (
          <p className="text-sm text-pulse-navy/70">Loading...</p>
        )}

        {!loading && data && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-black/10 bg-pulse-green/85 p-5 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-pulse-navy">
                Totals for {data.date}
              </h2>

              <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-5">
                <div className="rounded-xl border border-black/10 bg-white/50 p-3">
                  <div className="text-xs text-pulse-navy/70">Calories</div>
                  <div className="font-bold text-pulse-navy">
                    {data.totals.calories}
                  </div>
                </div>

                <div className="rounded-xl border border-black/10 bg-white/50 p-3">
                  <div className="text-xs text-pulse-navy/70">Protein</div>
                  <div className="font-bold text-pulse-navy">
                    {data.totals.protein_g}g
                  </div>
                </div>

                <div className="rounded-xl border border-black/10 bg-white/50 p-3">
                  <div className="text-xs text-pulse-navy/70">Carbs</div>
                  <div className="font-bold text-pulse-navy">
                    {data.totals.carbs_g}g
                  </div>
                </div>

                <div className="rounded-xl border border-black/10 bg-white/50 p-3">
                  <div className="text-xs text-pulse-navy/70">Fat</div>
                  <div className="font-bold text-pulse-navy">
                    {data.totals.fat_g}g
                  </div>
                </div>

                <div className="rounded-xl border border-black/10 bg-white/50 p-3">
                  <div className="text-xs text-pulse-navy/70">Fiber</div>
                  <div className="font-bold text-pulse-navy">
                    {data.totals.fiber_g}g
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-pulse-yellow/85 p-5 shadow-sm">
              <h2 className="mb-3 text-xl font-bold text-pulse-navy">Logs</h2>

              {data.logs.length === 0 ? (
                <p className="text-sm text-pulse-navy/70">
                  No logs found for this date.
                </p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-black/10 bg-white/40">
                  <table className="w-full border-collapse text-sm">
                    <thead className="bg-white/30">
                      <tr className="text-left text-pulse-navy">
                        <th className="px-3 py-2">Food</th>
                        <th className="px-3 py-2">Qty (g)</th>
                        <th className="px-3 py-2">Calories</th>
                        <th className="px-3 py-2">P</th>
                        <th className="px-3 py-2">C</th>
                        <th className="px-3 py-2">F</th>
                        <th className="px-3 py-2">Fiber</th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.logs.map((log) => (
                        <tr
                          key={log.id}
                          className="border-t border-black/10"
                        >
                          <td className="px-3 py-2 font-semibold text-pulse-navy">
                            {log.food?.name || "Unknown"}
                          </td>
                          <td className="px-3 py-2 text-pulse-navy/80">
                            {log.quantity_g}
                          </td>
                          <td className="px-3 py-2 text-pulse-navy/80">
                            {log.calculated?.calories ?? 0}
                          </td>
                          <td className="px-3 py-2 text-pulse-navy/80">
                            {log.calculated?.protein_g ?? 0}g
                          </td>
                          <td className="px-3 py-2 text-pulse-navy/80">
                            {log.calculated?.carbs_g ?? 0}g
                          </td>
                          <td className="px-3 py-2 text-pulse-navy/80">
                            {log.calculated?.fat_g ?? 0}g
                          </td>
                          <td className="px-3 py-2 text-pulse-navy/80">
                            {log.calculated?.fiber_g ?? 0}g
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

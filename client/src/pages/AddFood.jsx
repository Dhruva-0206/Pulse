import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";

const API = "http://localhost:5000/api";

export default function AddFood() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  const [selectedFood, setSelectedFood] = useState(null);
  const [qty, setQty] = useState(100);

  const [logSearch, setLogSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const [logging, setLogging] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: ""
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    const q = logSearch.trim();

    if (!q) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setSearchError("");

        const res = await fetch(
          `${API}/search?q=${encodeURIComponent(q)}&limit=10`,
          { headers }
        );

        if (!res.ok) throw new Error("Search failed");

        const data = await res.json();
        setSearchResults(data.foods || []);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
        setSearchError("Error searching foods");
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [logSearch, headers]);

  const pickFoodFromSearch = (food) => {
    setSelectedFood({
      id: Number(food.id),
      name: food.name,
      source: food.source
    });

    setLogSearch(food.name);
    setSearchResults([]);

    showToast(
      `Selected: ${food.name} (${food.source === "usda" ? "USDA" : "Custom"})`,
      "success"
    );
  };

  const logFood = async () => {
    try {
      if (!selectedFood?.id) {
        showToast("Please select a food first", "error");
        return;
      }

      const grams = Number(qty || 0);
      if (!grams || grams <= 0) {
        showToast("Quantity must be greater than 0", "error");
        return;
      }

      setLogging(true);

      const res = await fetch(`${API}/logs`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          food_id: selectedFood.id,
          quantity_g: grams
        })
      });

      if (!res.ok) throw new Error("Log food failed");

      showToast("Food logged successfully ✅", "success");

      setQty(100);
      setSelectedFood(null);
      setLogSearch("");
      setSearchResults([]);
    } catch (err) {
      console.error(err);
      showToast("Error logging food", "error");
    } finally {
      setLogging(false);
    }
  };

  const navyInput =
    "mt-1 w-full rounded-xl border border-white/20 bg-pulse-navy/85 px-3 py-2 text-sm text-white placeholder:text-white/60 outline-none focus:ring-2 focus:ring-white/30";

  return (
    <Layout>
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast((t) => ({ ...t, show: false }))}
      />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-pulse-navy">Add Food</h2>
          <p className="text-sm text-pulse-navy/70">
            Search USDA + Custom foods and log your meals
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            to="/new-food"
            className="rounded-xl bg-pulse-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            + Add Custom
          </Link>

          <Link
            to="/foods"
            className="rounded-xl bg-pulse-blue/40 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:bg-pulse-blue/60"
          >
            Manage Custom
          </Link>

          <button
            onClick={logout}
            className="rounded-xl bg-pulse-red px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="w-full max-w-3xl rounded-2xl border border-black/10 bg-pulse-navy/85 p-8 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-white">Log your food</h3>
            <p className="text-sm text-white/70">
              Search foods, select one, then enter grams
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-semibold text-white/90">
                Search Food (USDA + Custom)
              </div>

              <input
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setSelectedFood(null);
                }}
                placeholder="Type food name (rice, milk, paneer...)"
                className={navyInput}
              />

              {searchError && (
                <div className="mt-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {searchError}
                </div>
              )}

              {logSearch.trim().length > 0 && (
                <div className="mt-2 max-h-64 space-y-2 overflow-auto pr-1">
                  {searchLoading ? (
                    <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white/70">
                      Searching...
                    </div>
                  ) : searchResults.length ? (
                    searchResults.map((f) => (
                      <button
                        key={`${f.source}-${f.id}`}
                        onClick={() => pickFoodFromSearch(f)}
                        className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-left transition hover:bg-white/15"
                      >
                        <div className="font-semibold text-white">
                          {f.name}
                        </div>

                        {f.source === "custom" ? (
                          <div className="mt-1 text-xs text-white/70">
                            {f.calories_per_100g} kcal / 100g • P{" "}
                            {f.protein_per_100g}g • C {f.carbs_per_100g}g • F{" "}
                            {f.fat_per_100g}g
                          </div>
                        ) : (
                          <div className="mt-1 text-xs text-white/60">
                            {f.data_type || "food"}
                            {f.publication_date
                              ? ` • ${f.publication_date}`
                              : ""}
                          </div>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3 text-sm text-white/70">
                      No results found.
                    </div>
                  )}
                </div>
              )}

              {selectedFood && (
                <div className="mt-3 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white">
                  ✅ Selected{" "}
                  <span className="font-semibold">
                    {selectedFood.name}
                  </span>{" "}
                  <span className="text-white/70">
                    ({selectedFood.source === "usda" ? "USDA" : "Custom"})
                  </span>
                </div>
              )}
            </div>

            <div>
              <div className="text-sm font-semibold text-white/90">
                Quantity (grams)
              </div>
              <input
                type="number"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className={navyInput}
              />
            </div>

            <button
              onClick={logFood}
              disabled={logging}
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-pulse-navy transition hover:opacity-90 disabled:opacity-60"
            >
              {logging ? "Logging..." : "Log Food"}
            </button>

            <div className="text-xs text-white/70">
              Tip: Add custom foods using{" "}
              <b className="text-white">+ Add Custom</b>.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

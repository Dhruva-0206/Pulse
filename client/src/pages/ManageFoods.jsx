import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/api";
import Layout from "../components/Layout";

export default function ManageFoods() {
  const [foods, setFoods] = useState([]);
  const [msg, setMsg] = useState("");

  const [search, setSearch] = useState("");
  const [q, setQ] = useState("");

  const limit = 50;
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(false);

  const loadFoods = async (newOffset = offset, newQ = q) => {
    try {
      setLoading(true);
      setMsg("");

      const res = await api.get("/api/foods", {
        params: {
          limit,
          offset: newOffset,
          q: newQ
        }
      });

      setFoods(res.data.foods || []);
    } catch (error) {
      console.error(error);
      setMsg(error.response?.data?.message || "Error loading foods");
      setFoods([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods(0, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applySearch = () => {
    const trimmed = search.trim();
    setQ(trimmed);
    setOffset(0);
    loadFoods(0, trimmed);
  };

  const clearSearch = () => {
    setSearch("");
    setQ("");
    setOffset(0);
    loadFoods(0, "");
  };

  const nextPage = () => {
    const newOffset = offset + limit;
    setOffset(newOffset);
    loadFoods(newOffset, q);
  };

  const prevPage = () => {
    const newOffset = Math.max(0, offset - limit);
    setOffset(newOffset);
    loadFoods(newOffset, q);
  };

  const updateFood = async (food) => {
    try {
      setMsg("");

      await api.put(`/api/foods/${food.id}`, {
        name: food.name,
        calories_per_100g: Number(food.calories_per_100g || 0),
        protein_per_100g: Number(food.protein_per_100g || 0),
        carbs_per_100g: Number(food.carbs_per_100g || 0),
        fat_per_100g: Number(food.fat_per_100g || 0),
        fiber_per_100g: Number(food.fiber_per_100g || 0)
      });

      setMsg("Food updated ✅");
      loadFoods(offset, q);
    } catch (error) {
      console.error(error);
      setMsg(error.response?.data?.message || "Error updating food");
    }
  };

  const deleteFood = async (id) => {
    if (!confirm("Are you sure you want to delete this food?")) return;

    try {
      setMsg("");
      await api.delete(`/api/foods/${id}`);
      setMsg("Food deleted ✅");
      loadFoods(offset, q);
    } catch (error) {
      console.error(error);
      setMsg(error.response?.data?.message || "Error deleting food");
    }
  };

  const card =
    "rounded-2xl border border-black/10 bg-pulse-blue/85 p-6 shadow-sm";

  const input =
    "w-full rounded-xl border border-black/10 bg-white/70 px-3 py-2 text-sm text-pulse-navy placeholder:text-pulse-navy/50 outline-none focus:ring-2 focus:ring-pulse-navy/20";

  const softBlueBtn =
    "rounded-xl bg-white/50 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:bg-white/70 border border-black/10";

  const navyBtn =
    "rounded-xl bg-pulse-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90";

  const pageBtn =
    "rounded-xl bg-white/70 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:bg-white/90 border border-black/10 disabled:opacity-50";

  return (
    <Layout>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-pulse-navy">Manage Foods</h2>
          <p className="text-sm text-pulse-navy/70">
            Search, edit or delete foods
          </p>
        </div>

        <Link to="/add-food" className={navyBtn}>
          ← Back
        </Link>
      </div>

      {msg && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
          {msg}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className={"lg:col-span-5 self-start " + card}>
          <h3 className="text-lg font-bold text-pulse-navy">Search Foods</h3>
          <p className="mt-1 text-sm text-pulse-navy/70">
            Find foods using keyword search
          </p>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              className={input}
              placeholder="Search food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
            />

            <div className="flex gap-2">
              <button onClick={applySearch} className={softBlueBtn}>
                Search
              </button>
              <button onClick={clearSearch} className={softBlueBtn}>
                Clear
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-pulse-navy/70">
              Showing <b>{foods.length}</b>{" "}
              {q ? (
                <>
                  results for <b>"{q}"</b>
                </>
              ) : (
                <>foods</>
              )}
              <div className="mt-1 text-xs text-pulse-navy/50">
                Offset: <b>{offset}</b> • Limit: <b>{limit}</b>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={prevPage}
                disabled={offset === 0 || loading}
                className={pageBtn}
              >
                Prev
              </button>

              <button
                onClick={nextPage}
                disabled={loading || foods.length < limit}
                className={pageBtn}
              >
                Next
              </button>
            </div>
          </div>

          {loading && (
            <div className="mt-4 text-sm text-pulse-navy/70">
              Loading foods...
            </div>
          )}

          {!loading && foods.length === 0 && (
            <div className="mt-4 text-sm text-pulse-navy/70">
              No foods found.
            </div>
          )}
        </div>

        <div className={"lg:col-span-7 " + card}>
          <h3 className="text-lg font-bold text-pulse-navy">Food Results</h3>
          <p className="mt-1 text-sm text-pulse-navy/70">
            Edit values or delete foods
          </p>

          <div className="mt-4 max-h-130 space-y-3 overflow-auto pr-1">
            {foods.map((food) => (
              <FoodRow
                key={food.id}
                food={food}
                onUpdate={updateFood}
                onDelete={deleteFood}
                softBlueBtn={softBlueBtn}
                input={input}
                navyBtn={navyBtn}
              />
            ))}

            {!loading && foods.length === 0 && (
              <div className="text-sm text-pulse-navy/70">
                No foods to show.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function FoodRow({ food, onUpdate, onDelete, softBlueBtn, input, navyBtn }) {
  const [edit, setEdit] = useState(false);
  const [local, setLocal] = useState(food);

  useEffect(() => {
    setLocal(food);
  }, [food]);

  const handleChange = (e) => {
    setLocal({ ...local, [e.target.name]: e.target.value });
  };

  const Field = ({ label, name, placeholder }) => (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-pulse-navy/70">{label}</div>
      <input
        className={input}
        name={name}
        value={local[name]}
        placeholder={placeholder}
        onChange={handleChange}
      />
    </div>
  );

  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-pulse-navy">
            {food.name}
          </h3>
          <p className="mt-1 text-xs text-pulse-navy/60">
            {food.calories_per_100g} kcal / 100g • P {food.protein_per_100g}g • C{" "}
            {food.carbs_per_100g}g • F {food.fat_per_100g}g • Fiber{" "}
            {food.fiber_per_100g}g
          </p>
        </div>

        <div className="flex shrink-0 gap-2">
          <button className={softBlueBtn} onClick={() => setEdit(!edit)}>
            {edit ? "Cancel" : "Edit"}
          </button>

          <button
            className="rounded-xl bg-pulse-red px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            onClick={() => onDelete(food.id)}
          >
            Delete
          </button>
        </div>
      </div>

      {edit && (
        <div className="mt-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <div className="col-span-2 md:col-span-3">
              <Field
                label="Food Name"
                name="name"
                placeholder="Enter name..."
              />
            </div>

            <Field
              label="Calories (kcal / 100g)"
              name="calories_per_100g"
              placeholder="0"
            />
            <Field
              label="Protein (g / 100g)"
              name="protein_per_100g"
              placeholder="0"
            />
            <Field
              label="Carbs (g / 100g)"
              name="carbs_per_100g"
              placeholder="0"
            />
            <Field
              label="Fat (g / 100g)"
              name="fat_per_100g"
              placeholder="0"
            />
            <Field
              label="Fiber (g / 100g)"
              name="fiber_per_100g"
              placeholder="0"
            />
          </div>

          <button
            className={"mt-4 w-full py-3 " + navyBtn}
            onClick={() => onUpdate(local)}
          >
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Toast from "../components/Toast";

const API = "http://localhost:5000/api";

export default function NewFood() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }),
    [token]
  );

  const [form, setForm] = useState({
    name: "",
    calories_per_100g: 0,
    protein_per_100g: 0,
    carbs_per_100g: 0,
    fat_per_100g: 0,
    fiber_per_100g: 0
  });

  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState({
    show: false,
    type: "success",
    message: ""
  });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
  };

  const onChange = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
  };

  const saveFood = async () => {
    try {
      if (!form.name.trim()) {
        showToast("Food name is required", "error");
        return;
      }

      setSaving(true);

      const res = await fetch(`${API}/foods`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: form.name.trim(),
          calories_per_100g: Number(form.calories_per_100g || 0),
          protein_per_100g: Number(form.protein_per_100g || 0),
          carbs_per_100g: Number(form.carbs_per_100g || 0),
          fat_per_100g: Number(form.fat_per_100g || 0),
          fiber_per_100g: Number(form.fiber_per_100g || 0)
        })
      });

      if (!res.ok) {
        throw new Error("Create food failed");
      }

      showToast("Food created successfully ✅", "success");

      setTimeout(() => {
        navigate("/add-food");
      }, 700);
    } catch (err) {
      console.error(err);
      showToast("Error creating food", "error");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-black/10 bg-white/45 px-3 py-2 text-sm text-pulse-navy placeholder:text-pulse-navy/50 outline-none focus:ring-2 focus:ring-pulse-navy/25";

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
          <h2 className="text-2xl font-bold text-pulse-navy">Add New Food</h2>
          <p className="text-sm text-pulse-navy/70">
            Create a custom food with macros per 100g
          </p>
        </div>

        <Link
          to="/add-food"
          className="rounded-xl bg-pulse-blue/40 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:bg-pulse-blue/60"
        >
          ← Back
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-black/10 bg-pulse-green/85 p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field label="Food Name">
            <input
              value={form.name}
              onChange={(e) => onChange("name", e.target.value)}
              placeholder="e.g. Paneer, Banana, Oats..."
              className={inputClass}
            />
          </Field>

          <Field label="Calories / 100g">
            <input
              type="number"
              value={form.calories_per_100g}
              onChange={(e) =>
                onChange("calories_per_100g", e.target.value)
              }
              className={inputClass}
            />
          </Field>

          <Field label="Protein / 100g">
            <input
              type="number"
              value={form.protein_per_100g}
              onChange={(e) =>
                onChange("protein_per_100g", e.target.value)
              }
              className={inputClass}
            />
          </Field>

          <Field label="Carbs / 100g">
            <input
              type="number"
              value={form.carbs_per_100g}
              onChange={(e) => onChange("carbs_per_100g", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Fat / 100g">
            <input
              type="number"
              value={form.fat_per_100g}
              onChange={(e) => onChange("fat_per_100g", e.target.value)}
              className={inputClass}
            />
          </Field>

          <Field label="Fiber / 100g">
            <input
              type="number"
              value={form.fiber_per_100g}
              onChange={(e) => onChange("fiber_per_100g", e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <button
          onClick={saveFood}
          disabled={saving}
          className="mt-5 w-full rounded-xl bg-pulse-navy px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Food"}
        </button>

        <div className="mt-3 text-xs text-pulse-navy/70">
          Values should be per{" "}
          <b className="text-pulse-navy">100g</b>. You can edit later from{" "}
          <b className="text-pulse-navy">Manage Foods</b>.
        </div>
      </div>
    </Layout>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="text-sm font-semibold text-pulse-navy">{label}</div>
      {children}
    </div>
  );
}

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/api";
import Layout from "../components/Layout";

export default function Profile() {
  const [searchParams] = useSearchParams();
  const isFirstSetup = searchParams.get("setup") === "1";

  const [msg, setMsg] = useState("");
  const [editing, setEditing] = useState(false);

  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const [userInfo, setUserInfo] = useState({
    name: "",
    email: ""
  });

  const [form, setForm] = useState({
    age: "",
    gender: "male",
    height_cm: "",
    weight_kg: "",
    activity_level: "moderate",
    goal: "maintain"
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  useEffect(() => {
    const init = async () => {
      try {
        setMsg("");

        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (storedUser) {
          setUserInfo({
            name: storedUser.name,
            email: storedUser.email
          });
        }

        const res = await api.get("/api/profile");
        if (res.data.profile) {
          setForm(res.data.profile);
        }
      } catch {
        if (isFirstSetup) {
          setMsg("Please complete your profile to continue 🚀");
          setEditing(true);
        }
      }
    };

    init();
  }, [isFirstSetup]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const saveProfile = async () => {
    try {
      setMsg("");

      await api.post("/api/profile", {
        age: Number(form.age),
        gender: form.gender,
        height_cm: Number(form.height_cm),
        weight_kg: Number(form.weight_kg),
        activity_level: form.activity_level,
        goal: form.goal
      });

      setMsg("Profile saved successfully ✅");
      setEditing(false);
    } catch (error) {
      setMsg(error.response?.data?.message || "Error saving profile");
    }
  };

  const changePassword = async () => {
    try {
      setPwdMsg("");

      if (!passwords.current || !passwords.new || !passwords.confirm) {
        setPwdMsg("Please fill all password fields.");
        return;
      }

      if (passwords.new.length < 6) {
        setPwdMsg("New password must be at least 6 characters.");
        return;
      }

      if (passwords.new !== passwords.confirm) {
        setPwdMsg("New password and confirm password do not match.");
        return;
      }

      setPwdLoading(true);

      await api.post("/api/profile/change-password", {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });

      setPwdMsg("Password updated successfully ✅");
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (error) {
      setPwdMsg(error.response?.data?.message || "Error updating password");
    } finally {
      setPwdLoading(false);
    }
  };

  const inputClass = (disabled) =>
    `px-3 py-2 rounded-lg border border-black/10 bg-white/45 text-pulse-navy placeholder:text-pulse-navy/50 outline-none ${
      disabled
        ? "cursor-not-allowed opacity-70"
        : "focus:ring-2 focus:ring-pulse-navy/25"
    }`;

  return (
    <Layout title="Profile">
      <div className="mt-10 flex justify-center">
        <div className="w-full max-w-2xl">
          {msg && (
            <div className="mb-4 rounded-xl border border-black/10 bg-pulse-blue/25 p-3 text-sm text-pulse-navy">
              {msg}
            </div>
          )}

          <div className="rounded-2xl border border-black/10 bg-pulse-blue/99 p-6 shadow-sm">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pulse-navy">
                {userInfo.name}
              </h2>
              <p className="text-sm text-pulse-navy/70">
                {userInfo.email}
              </p>
            </div>

            <h3 className="mb-4 text-lg font-bold text-pulse-navy">
              Your Details
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <input
                disabled={!editing}
                className={inputClass(!editing)}
                name="age"
                placeholder="Age"
                value={form.age || ""}
                onChange={handleChange}
              />

              <select
                disabled={!editing}
                className={inputClass(!editing)}
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <input
                disabled={!editing}
                className={inputClass(!editing)}
                name="height_cm"
                placeholder="Height (cm)"
                value={form.height_cm || ""}
                onChange={handleChange}
              />

              <input
                disabled={!editing}
                className={inputClass(!editing)}
                name="weight_kg"
                placeholder="Weight (kg)"
                value={form.weight_kg || ""}
                onChange={handleChange}
              />

              <select
                disabled={!editing}
                className={inputClass(!editing)}
                name="activity_level"
                value={form.activity_level}
                onChange={handleChange}
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="active">Active</option>
                <option value="very_active">Very Active</option>
              </select>

              <select
                disabled={!editing}
                className={inputClass(!editing)}
                name="goal"
                value={form.goal}
                onChange={handleChange}
              >
                <option value="lose">Lose Weight</option>
                <option value="maintain">Maintain</option>
                <option value="gain">Gain Weight</option>
              </select>

              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="col-span-2 rounded-lg bg-pulse-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={saveProfile}
                    className="rounded-lg bg-pulse-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Save
                  </button>

                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg bg-white/60 px-4 py-2 text-sm font-semibold text-pulse-navy transition hover:opacity-90"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            <div className="mt-8">
              <h4 className="mb-2 font-semibold text-pulse-navy">
                Change Password
              </h4>

              {pwdMsg && (
                <div className="mb-3 rounded-xl border border-black/10 bg-white/40 p-3 text-sm text-pulse-navy">
                  {pwdMsg}
                </div>
              )}

              <div className="grid grid-cols-1 gap-3">
                <input
                  type="password"
                  placeholder="Current password"
                  className={inputClass(false)}
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      current: e.target.value
                    })
                  }
                />

                <input
                  type="password"
                  placeholder="New password"
                  className={inputClass(false)}
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      new: e.target.value
                    })
                  }
                />

                <input
                  type="password"
                  placeholder="Confirm new password"
                  className={inputClass(false)}
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords({
                      ...passwords,
                      confirm: e.target.value
                    })
                  }
                />

                <button
                  onClick={changePassword}
                  disabled={pwdLoading}
                  className="rounded-lg bg-pulse-navy px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                  {pwdLoading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

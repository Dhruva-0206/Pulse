import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddFood from "./pages/AddFood";
import History from "./pages/History";
import Profile from "./pages/Profile";
import NewFood from "./pages/NewFood";
import ManageFoods from "./pages/ManageFoods";
import Tracking from "./pages/Tracking";
import PulseAi from "./pages/PulseAi";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/tracking"
          element={
            <PrivateRoute>
              <Tracking />
            </PrivateRoute>
          }
        />

        <Route
          path="/add-food"
          element={
            <PrivateRoute>
              <AddFood />
            </PrivateRoute>
          }
        />

        <Route
          path="/new-food"
          element={
            <PrivateRoute>
              <NewFood />
            </PrivateRoute>
          }
        />

        <Route
          path="/foods"
          element={
            <PrivateRoute>
              <ManageFoods />
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/pulseai"
          element={
            <PrivateRoute>
              <PulseAi />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

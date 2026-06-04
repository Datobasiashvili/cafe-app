import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import Loading from "./components/Loading";

import Login from "./pages/Login";
import Stats from "./pages/Stats";
import AddOrder from "./pages/AddOrder";
import Orders from "./pages/Orders";
import Settings from "./pages/Settings";

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return < Loading />

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/dashboard" replace />}
        />

        <Route element={<ProtectedRoute allowedRoles={["receptionist", "staff"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/analytics" element={<Stats />} />
            <Route path="/orders" element={<Orders />} />
            
            <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
              <Route path="/add-order" element={<AddOrder />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}
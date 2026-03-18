import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Signup from "./pages/auth/signup";
import Login from "./pages/auth/login";
import ProtectedRoute from "./components/layouts/ProtectedRoute";
import PublicRoute from "./components/layouts/PublicRoute";

const Dashboard = lazy(() => import("./pages/dashboard/dashboard"));

function App() {
  return (
    <Router>
      <Routes>

        <Route element={<PublicRoute />}>
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
                <Dashboard />
              </Suspense>
            }
          />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
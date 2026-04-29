import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import AddLead from "./pages/AddLead";
import EditLead from "./pages/EditLead";
import SalesPerformance from "./pages/SalesPerformance";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import Login from "./pages/Login";
import Inventory from "./pages/Inventory";
import SalesReport from "./pages/SalesReport";
import Complaints from "./pages/Complaints";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN ROUTE */}
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />

        {/* PROTECTED ROUTES */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Layout>
                <Leads />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-lead"
          element={
            <ProtectedRoute>
              <Layout>
                <AddLead />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/edit/:id"
          element={
            <ProtectedRoute>
              <Layout>
                <EditLead />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/sales"
          element={
            <ProtectedRoute>
              <Layout>
                <SalesPerformance />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route path="/inventory" element={
          <ProtectedRoute>
            <Layout>
              <Inventory />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/sales-report" element={
          <ProtectedRoute>
            <Layout>
              <SalesReport />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/complaints" element={
          <ProtectedRoute>
            <Layout>
              <Complaints />
            </Layout>
          </ProtectedRoute>
        } />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
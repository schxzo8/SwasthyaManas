import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PublicContent from "./pages/PublicContent";
import ProtectedRoute from "./components/ProtectedRoute";
import VerifyEmail from "./pages/VerifyEmail";
import AdminRoute from "./components/AdminRoute";
import AssessmentHome from "./pages/AssessmentHome";
import PHQ9Form from "./pages/PHQ9Form";
import GAD7Form from "./pages/GAD7Form";
import AssessmentResult from "./pages/AssessmentResult";
import AssessmentHistory from "./pages/AssessmentHistory";
import Experts from "./pages/Experts";
import MyConsultations from "./pages/MyConsultations";
import ExpertInbox from "./pages/ExpertInbox";
import UserRoute from "./components/UserRoute";
import ExpertRoute from "./components/ExpertRoute";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC LAYOUT */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/content" element={<PublicContent />} />
        </Route>

        {/* AUTH PAGES (NO NAVBAR) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* PROTECTED */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        <Route
          path="/assessments"
          element={
            <ProtectedRoute>
              <AssessmentHome />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments/phq9"
          element={
            <ProtectedRoute>
              <PHQ9Form />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments/gad7"
          element={
            <ProtectedRoute>
              <GAD7Form />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments/result"
          element={
            <ProtectedRoute>
              <AssessmentResult />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments/history"
          element={
            <ProtectedRoute>
              <AssessmentHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/experts"
          element={
            <ProtectedRoute>
              <UserRoute>
                <Experts />
              </UserRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/consultations"
          element={
            <ProtectedRoute>
              <UserRoute>
                <MyConsultations />
              </UserRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/expert/inbox"
          element={
            <ProtectedRoute>
              <ExpertRoute>
                <ExpertInbox />
              </ExpertRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

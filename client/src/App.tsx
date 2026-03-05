import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import RootLayout from "./layouts/RootLayout";
import ScrollToTop from "./components/ScrollToTop";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";

import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PublicContent from "./pages/PublicContent";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import AssessmentHome from "./pages/AssessmentHome";
import PHQ9Form from "./pages/PHQ9Form";
import GAD7Form from "./pages/GAD7Form";
import AssessmentResult from "./pages/AssessmentResult";
import AssessmentHistory from "./pages/AssessmentHistory";
import Experts from "./pages/Experts";
import MyConsultations from "./pages/MyConsultations";
import Inbox from "./pages/Inbox";
import BookingPage from "./pages/BookingPage";
import AppointmentPage from "./pages/AppointmentPage";

import { NotificationsProvider } from "./context/NotificationsContext";

function App() {
  return (
    <NotificationsProvider> {/* global notification system */}
    <BrowserRouter>
    <ScrollToTop />
      <Routes>
        {/* Everything shares ONE layout */}
        <Route element={<RootLayout />}>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/content" element={<PublicContent />} />

          {/* AUTH (still public routes, but share same layout) */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* PROTECTED */}
          <Route
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/assessments" element={<AssessmentHome />} />
            <Route path="/assessments/phq9" element={<PHQ9Form />} />
            <Route path="/assessments/gad7" element={<GAD7Form />} />
            <Route path="/assessments/result" element={<AssessmentResult />} />
            <Route path="/assessments/history" element={<AssessmentHistory />} />

            <Route path="/experts" element={<Experts />} />
            <Route path="/book/:expertId" element={<BookingPage />} />
            <Route path="/consultations" element={<MyConsultations />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/appointments" element={<AppointmentPage />} />
          </Route>

          {/* ADMIN */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
    </NotificationsProvider>
  );
}

export default App;
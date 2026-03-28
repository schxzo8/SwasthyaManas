import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";

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
import UserSettings from "./pages/UserSettings";
import MySlots from "./pages/MySlots";
import PaymentVerify from "./pages/PaymentVerify";
import PaymentFailure from "./pages/PaymentFailure";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./context/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

import { NotificationsProvider } from "./context/NotificationsContext";

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <NotificationsProvider>
        <ScrollToTop />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#ffffff",
              color: "#2D3436",
              border: "1px solid #E8F0E9",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              padding: "14px 18px",
              fontWeight: "500",
              minWidth: "260px",
            },
            success: {
              style: {
                background: "#f0faf4",
                color: "#1a5c35",
                border: "1px solid #7C9A82",
              },
              iconTheme: { primary: "#7C9A82", secondary: "#ffffff" },
            },
            error: {
              style: {
                background: "#fff5f5",
                color: "#991b1b",
                border: "1px solid #f87171",
              },
              iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
            },
          }}
        />
        <Routes>
          <Route element={<RootLayout />}>
            {/* PUBLIC */}
            <Route path="/" element={<Home />} />
            <Route path="/content" element={<PublicContent />} />
            <Route path="/appointments/payment-verify"  element={<PaymentVerify />} />
            <Route path="/appointments/payment-success" element={<PaymentVerify />} />
            <Route path="/appointments/payment-failure" element={<PaymentFailure />} />

            {/* AUTH */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

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
              <Route path="/settings" element={<UserSettings />} />
              <Route path="/my-slots" element={<MySlots />} />
              <Route path="/appointments/payment-verify" element={<PaymentVerify />} />

              
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

            {/* 404 CATCH-ALL */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </NotificationsProvider>
      </ThemeProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
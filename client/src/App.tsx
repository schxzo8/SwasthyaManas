import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import AppLayout from "./layouts/AppLayout";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import PublicContent from "./pages/PublicContent";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import VerifyEmail from "./pages/VerifyEmail";

import AssessmentHome from "./pages/AssessmentHome";
import PHQ9Form from "./pages/PHQ9Form";
import GAD7Form from "./pages/GAD7Form";
import AssessmentResult from "./pages/AssessmentResult";
import AssessmentHistory from "./pages/AssessmentHistory";
import Experts from "./pages/Experts";
import MyConsultations from "./pages/MyConsultations";
import Inbox from "./pages/Inbox";
import BookingPage from "./pages/BookingPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />

        {/* PUBLIC */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/content" element={<PublicContent />} />
        </Route>

        {/* PROTECTED APP */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
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
          <Route path="/consultations" element={<MyConsultations />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/book/:expertId" element={<BookingPage />} />
          <Route path="/consultations" element={<MyConsultations />} />

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;

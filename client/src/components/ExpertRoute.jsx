import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function ExpertRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    if (decoded.role !== "expert") return <Navigate to="/dashboard" replace />;
    return children;
  } catch {
    return <Navigate to="/login" replace />;
  }
}

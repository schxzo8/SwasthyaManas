import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


function AdminRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.role !== "admin") {
      return <Navigate to="/dashboard" replace />;
    }
  } catch (error) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminRoute;

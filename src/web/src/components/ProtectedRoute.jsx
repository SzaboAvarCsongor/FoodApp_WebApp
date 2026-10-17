import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// only lets the given roles in, everyone else goes to the home page
// this is only for convenience, the real protection is in the backend
function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
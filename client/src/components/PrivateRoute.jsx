// PrivateRoute redirects unauthenticated users to /login.
// It simply wraps children and checks the auth context for a valid user.

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;

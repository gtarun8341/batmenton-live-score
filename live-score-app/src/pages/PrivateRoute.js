// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function PrivateRoute({ element: Component, ...props }) {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? <Component {...props} /> : <Navigate to="/empirelogin" replace />;
}

export default PrivateRoute;

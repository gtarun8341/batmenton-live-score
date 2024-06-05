import React from 'react';
import { Navigate } from 'react-router-dom';

function withAuthProtection(WrappedComponent) {
  return function ProtectedRoute(props) {
    const isLoggedIn = !!localStorage.getItem('umpireToken');

    if (!isLoggedIn) {
      return <Navigate to="/empirelogin" />;
    }

    return <WrappedComponent {...props} />;
  };
}

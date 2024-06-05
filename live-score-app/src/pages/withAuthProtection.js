import React from 'react';
import { Navigate } from 'react-router-dom';

function withAuthProtection(WrappedComponent, userType) {
  return function ProtectedRoute(props) {
    const isLoggedIn = !!localStorage.getItem(`${userType}Token`);
// console.log(userType)
    if (!isLoggedIn) {
      return <Navigate to={`/${userType}login`} />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withAuthProtection;

import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const PrivateRoute = ({ element: Component, ...rest }) => {
  const token = localStorage.getItem('token'); // Retrieve token from local storage

  return (
    <Route
      {...rest}
      element={token ? <Component /> : <Navigate to="/login" />}
    />
  );
};

export default PrivateRoute;

import React from 'react';
import { Navigate } from 'react-router-dom';

const ConnectionGuide: React.FC = () => {
  return <Navigate to="/connection-ceremony?tab=0" replace />;
};

export default ConnectionGuide;

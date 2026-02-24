import React from 'react';
import { Navigate } from 'react-router-dom';

const ScheduledMints: React.FC = () => {
  return <Navigate to="/connection-ceremony?tab=1" replace />;
};

export default ScheduledMints;

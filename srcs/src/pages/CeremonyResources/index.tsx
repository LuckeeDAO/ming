import React from 'react';
import { Navigate } from 'react-router-dom';

const CeremonyResources: React.FC = () => {
  return <Navigate to="/connection-ceremony?tab=2" replace />;
};

export default CeremonyResources;

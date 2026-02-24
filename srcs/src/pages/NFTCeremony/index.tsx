import React from 'react';
import { Navigate } from 'react-router-dom';

const NFTCeremony: React.FC = () => {
  return <Navigate to="/connection-ceremony?tab=0" replace />;
};

export default NFTCeremony;

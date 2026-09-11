import React from 'react';
import { mapApplicationStatus, mapTaskStatus } from '../../utils/statusMapper';
import { useAuth } from '../../context/AuthContext';

export function StatusBadge({ status, type = 'application', overrideRole = null }) {
  const { role: authRole } = useAuth();
  const role = overrideRole || authRole;

  const info =
    type === 'application'
      ? mapApplicationStatus(status, role)
      : mapTaskStatus(status, role);

  return (
    <span className={`badge badge-${info.variant}`}>
      <span className="badge-dot" />
      <span>{info.label}</span>
    </span>
  );
}

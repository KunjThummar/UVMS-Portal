import React from 'react';

export const StatusBadge = ({ status }) => {
  if (!status) return null;

  const normalized = status.toLowerCase();

  let badgeClass = 'badge-completed';
  let label = status;

  if (normalized === 'open') {
    badgeClass = 'badge-open';
    label = 'Open';
  } else if (normalized === 'applicationclosed' || normalized === 'application closed' || normalized === 'closed') {
    badgeClass = 'badge-closed';
    label = 'Application Closed';
  } else if (normalized === 'full') {
    badgeClass = 'badge-full';
    label = 'Capacity Full';
  } else if (normalized === 'completed') {
    badgeClass = 'badge-completed';
    label = 'Completed';
  } else if (normalized === 'pending') {
    badgeClass = 'badge-pending';
    label = 'Pending Review';
  } else if (normalized === 'approved') {
    badgeClass = 'badge-approved';
    label = 'Approved';
  } else if (normalized === 'rejected') {
    badgeClass = 'badge-rejected';
    label = 'Rejected';
  }

  return <span className={`badge ${badgeClass}`}>{label}</span>;
};

export default StatusBadge;

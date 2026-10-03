import React from 'react';

export const RoleBadge = ({ role }) => {
  if (!role) return null;

  const normalized = role.toLowerCase().replace(/[^a-z]/g, '');

  let badgeClass = 'badge-vol';
  let label = role;

  if (normalized === 'coordinator') {
    badgeClass = 'badge-coord';
    label = 'Coordinator';
  } else if (normalized === 'subcoordinator') {
    badgeClass = 'badge-subcoord';
    label = 'Sub-Coordinator';
  } else {
    badgeClass = 'badge-vol';
    label = 'Volunteer';
  }

  return <span className={`badge ${badgeClass}`}>● {label}</span>;
};

export default RoleBadge;

import React from 'react';

export const Loader = ({ message = 'Loading data...', size = 'md' }) => {
  const dimension = size === 'sm' ? 24 : size === 'lg' ? 48 : 36;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '48px 24px',
      gap: '14px',
      color: '#64748b'
    }}>
      <div style={{
        width: `${dimension}px`,
        height: `${dimension}px`,
        border: '3px solid #e2e8f0',
        borderTopColor: '#2563eb',
        borderRadius: '50%',
        animation: 'loaderSpin 0.75s linear infinite'
      }} />
      <style>{`@keyframes loaderSpin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: '14px', fontWeight: 500 }}>{message}</p>
    </div>
  );
};

export default Loader;

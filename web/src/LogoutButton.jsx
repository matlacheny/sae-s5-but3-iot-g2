import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
      navigate(
        '/login');
    /*if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      logout();
      navigate(
        '/login');
    }*/

  };

  return (
    <button
      onClick={handleLogout}
      style={{
        padding: '8px 16px',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      Déconnexion
    </button>
  );
};

export default LogoutButton;

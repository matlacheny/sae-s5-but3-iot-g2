import React from 'react';
import '../../styles/header.css';

const Header = ({ title }) => {
  return (
    <header className="app-header">
      <img src="/image/Logo.webp" alt="Logo Medibox" />
      <h1>{title}</h1>
    </header>
  );
};

export default Header;
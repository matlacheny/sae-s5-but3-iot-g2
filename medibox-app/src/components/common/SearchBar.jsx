import React from 'react';

const SearchBar = ({ value, onChange, placeholder = "Rechercher..." }) => {
  return (
    <div className="search-container">
      <input
        type="text"
        className="search-bar"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <span className="search-icon">🔍</span>
    </div>
  );
};

export default SearchBar;
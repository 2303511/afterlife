import React from 'react';

export default function SearchBar({ value, onChange, onSearch, onKeyPress, isLoading }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Enter user's phone number.."
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
      />
      <button onClick={onSearch} disabled={!value.trim() || isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}

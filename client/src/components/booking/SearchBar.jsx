import React from 'react';

export default function SearchBar({ value, onChange, onSearch, onKeyPress, isLoading }) {
  return (
    <div className="search-bar">
      <input
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="Enter user's phone number.."
        value={value}
        onChange={(e) => {
          const onlyNums = e.target.value.replace(/\D/g, '');
          onChange({ target: { value: onlyNums } });
        }}
      />

      <button onClick={onSearch} disabled={!value.trim() || isLoading}>
        {isLoading ? 'Searching...' : 'Search'}
      </button>
    </div>
  );
}

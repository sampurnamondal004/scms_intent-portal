import React from 'react';

export default function Input({ label, value, onChange, type = 'text', required }) {
  return (
    <label className="field-label">
      {label}
      <input
        className="scms-input"
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

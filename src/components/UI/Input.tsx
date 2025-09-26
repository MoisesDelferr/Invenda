import React from 'react';

interface InputProps {
  label?: string;
  type?: 'text' | 'number' | 'search' | 'email' | 'password';
  placeholder?: string;
  value: string | number;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  step?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
  min,
  step
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        min={min}
        step={step}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-colors text-gray-900 placeholder-gray-500"
      />
    </div>
  );
};
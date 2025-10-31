import React from 'react';
import clsx from 'clsx';

const Select = ({ label, error, required = false, children, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      <select
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error
            ? 'border-danger-500 focus:ring-danger-500'
            : 'border-gray-300',
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-sm text-danger-600 mt-1">{error}</p>}
    </div>
  );
};

export default Select;


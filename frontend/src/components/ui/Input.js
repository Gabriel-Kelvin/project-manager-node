import React from 'react';
import clsx from 'clsx';

const Input = ({
  label,
  error,
  helperText,
  required = false,
  className,
  maxLength,
  showCharCount = false,
  value,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-danger-600 ml-1">*</span>}
        </label>
      )}
      <input
        className={clsx(
          'w-full px-4 py-2 border rounded-lg transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          error
            ? 'border-danger-500 focus:ring-danger-500'
            : 'border-gray-300',
          className
        )}
        value={value}
        maxLength={maxLength}
        {...props}
      />
      <div className="flex items-center justify-between mt-1">
        <div>
          {error && <p className="text-sm text-danger-600">{error}</p>}
          {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
        </div>
        {showCharCount && maxLength && (
          <p className="text-xs text-gray-500">
            {value?.length || 0} / {maxLength}
          </p>
        )}
      </div>
    </div>
  );
};

export default Input;


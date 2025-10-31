import React from 'react';
import { clsx } from 'clsx';

const Textarea = React.forwardRef(({ 
  className, 
  error, 
  disabled, 
  ...props 
}, ref) => {
  return (
    <textarea
      ref={ref}
      className={clsx(
        'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors',
        error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
        disabled && 'bg-gray-50 text-gray-500 cursor-not-allowed',
        className
      )}
      disabled={disabled}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
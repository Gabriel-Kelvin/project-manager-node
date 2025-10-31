import React from 'react';
import clsx from 'clsx';

const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    // Status badges
    active: 'bg-success-100 text-success-800 border-success-300',
    completed: 'bg-gray-100 text-gray-800 border-gray-300',
    on_hold: 'bg-warning-100 text-warning-800 border-warning-300',
    
    // Priority badges
    high: 'bg-danger-100 text-danger-800 border-danger-300',
    medium: 'bg-warning-100 text-warning-800 border-warning-300',
    low: 'bg-success-100 text-success-800 border-success-300',
    
    // Role badges
    owner: 'bg-primary-100 text-primary-800 border-primary-300',
    manager: 'bg-purple-100 text-purple-800 border-purple-300',
    developer: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    viewer: 'bg-gray-100 text-gray-800 border-gray-300',
    
    // Task status badges
    todo: 'bg-gray-100 text-gray-800 border-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
    
    // Default
    default: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};

export default Badge;


import React from 'react';
import clsx from 'clsx';

const Card = ({ children, className, hover = false, onClick }) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200',
        hover && 'hover:shadow-md hover:border-gray-300 cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default Card;


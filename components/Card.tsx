import React from 'react';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white shadow-lg rounded-2xl overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
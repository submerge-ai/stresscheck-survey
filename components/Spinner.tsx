
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-base"></div>
    </div>
  );
};

export default Spinner;

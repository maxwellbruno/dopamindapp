
import React from 'react';

const MinimalSpinner: React.FC = () => (
  <div className="flex items-center justify-center w-full py-16">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-mint-green border-opacity-60"></div>
  </div>
);

export default MinimalSpinner;

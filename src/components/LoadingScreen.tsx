
import React from 'react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center animate-fade-in">
        <div className="mb-8 flex items-center justify-center">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mr-4 animate-pulse">
            <svg 
              className="w-10 h-10 text-white" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">Dopamind</h1>
        </div>
        <p className="text-lg text-gray-600 mb-4">Your Mental Health & Productivity Companion</p>
        <div className="w-12 h-1 bg-blue-500 rounded mx-auto animate-pulse"></div>
      </div>
    </div>
  );
};

export default LoadingScreen;

import React from 'react';

interface CelestialCardProps {
  title: string;
  description: string;
  icon?: string;
}

const CelestialCard: React.FC<CelestialCardProps> = ({ title, description, icon = "🌟" }) => {
  return (
    <div className="flex flex-col items-center p-6 max-w-sm mx-auto form-section">
      {/* Card container with glass effect and floating animation */}
      <div className="glass rounded-xl p-6 shadow-glow animate-float w-full">
        {/* Icon with slow pulse animation */}
        <div className="text-4xl mb-4 animate-pulse-slow text-center">
          {icon}
        </div>
        
        {/* Content */}
        <h2 className="text-xl font-bold text-white mb-2 text-center sparkle">
          {title}
        </h2>
        <p className="text-gray-300 text-center">
          {description}
        </p>
        
        {/* Cosmic button */}
        <button className="mt-4 w-full py-2 px-4 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-300">
          Explore More
        </button>
      </div>
    </div>
  );
};

export default CelestialCard; 
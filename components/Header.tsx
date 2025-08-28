
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 py-5 md:px-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-brand-primary dark:text-brand-secondary">
          Legal Document Demystifier
        </h1>
        <p className="mt-2 text-md md:text-lg text-gray-600 dark:text-gray-300">
          Unlock clarity from complexity. Your AI-powered legal assistant.
        </p>
      </div>
    </header>
  );
};

export default Header;

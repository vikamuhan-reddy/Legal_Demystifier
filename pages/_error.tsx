import React from 'react';
import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

const Error = ({ statusCode }: ErrorProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 text-center font-sans">
      <h1 className="text-4xl font-serif font-bold mb-4">
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </h1>
      <p className="text-muted-foreground mb-8">
        We apologize for the inconvenience. Please try refreshing the page.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-8 py-3 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-primary/90 transition-all shadow-lg"
      >
        Refresh Page
      </button>
    </div>
  );
};

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;

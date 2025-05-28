import React from 'react';

export default function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-lg rounded-lg">
        <h1 className="text-3xl font-bold text-center text-indigo-600 mb-4">Test Page</h1>
        <p className="text-gray-700 text-center">
          If you can see this, the routing is working correctly.
        </p>
      </div>
    </div>
  );
}

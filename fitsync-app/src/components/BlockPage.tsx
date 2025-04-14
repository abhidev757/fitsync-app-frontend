import React from 'react';

const BlockedPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="text-lg">
        Your account has been blocked by the admin. Please contact support for more information.
      </p>
    </div>
  );
};

export default BlockedPage;

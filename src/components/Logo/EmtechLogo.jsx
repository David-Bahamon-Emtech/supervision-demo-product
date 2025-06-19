import React from 'react';

const EmtechLogo = ({ logoUrl, altText = "Company Logo" }) => {
  if (!logoUrl) {
    return null;
  }

  return (
    <div className="flex items-center justify-center">
      <img
        src={logoUrl}
        alt={altText}
        className="w-2/3 h-auto" // Adjust styling as needed
      />
    </div>
  );
};

export default EmtechLogo;
import React from 'react';

const MasterpieceIcon = ({ className = "w-7 h-4" }) => {
  return (
    <div className={`relative flex items-center justify-between ${className}`}>
      {/* Левый листочек */}
      <img
        src="https://yastatic.net/s3/kinopoisk-frontend/hd-www/release/_next/static/media/top-leaf-left.90671afb.png"
        alt=""
        className="w-4 h-4 object-contain"
      />
      {/* Правый листочек */}
      <img
        src="https://yastatic.net/s3/kinopoisk-frontend/hd-www/release/_next/static/media/top-leaf-right.b7500ae8.png"
        alt=""
        className="w-4 h-4 object-contain"
      />
    </div>
  );
};

export default MasterpieceIcon;
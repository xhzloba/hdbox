import React, { useContext } from "react";
import SettingsContext from "../contexts/SettingsContext";

// Локальный компонент скелетона с правильной анимацией
const SkeletonElement = ({ className = "", ...props }) => {
  return (
    <div
      className={`bg-muted animate-pulse rounded-md ${className}`}
      {...props}
    />
  );
};

const MovieCardSkeleton = () => {
  const settingsContext = useContext(SettingsContext);
  const showDetails = settingsContext?.showDetails ?? true; // По умолчанию показываем детали

  return (
    <div
      className={`group relative overflow-hidden transition-all duration-300 cursor-pointer border border-transparent flex flex-col ${
        showDetails
          ? "bg-card rounded-lg h-[200px] md:h-[390px] w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px]"
          : "w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px] aspect-[2/4] rounded-lg"
      }`}
    >
      {/* Постер скелетон */}
      <div
        className={`relative overflow-hidden ${
          showDetails ? "h-[200px] md:h-[270px]" : "w-full h-full"
        }`}
      >
        <SkeletonElement className="w-full h-full" />
      </div>

      {/* Текстовый блок с информацией о фильме - показывается только если включены детали */}
      {showDetails && (
        <div className="p-2 md:p-3 hidden md:block">
          <SkeletonElement className="h-4 w-full mb-1" />
          <div className="flex items-center gap-2">
            <SkeletonElement className="h-3 w-12" />
            <SkeletonElement className="h-5 w-16 rounded" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCardSkeleton;

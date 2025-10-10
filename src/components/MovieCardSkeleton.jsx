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

// Крутящийся значок фильма для центра постера
const FilmSpinner = ({ className = "" }) => (
  <svg
    className={`animate-spin duration-1000 ${className}`}
    viewBox="0 0 48 48"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      clipRule="evenodd"
      d="M42 24C42 31.2328 38.3435 37.6115 32.7782 41.3886C33.1935 41.2738 33.602 41.1447 34 41C45.1693 36.9384 47 32 47 32L48 35C48 35 44.3832 40.459 34.5 43.5C28 45.5 21 45 21 45C9.40202 45 0 35.598 0 24C0 12.402 9.40202 3 21 3C32.598 3 42 12.402 42 24ZM21 19C24.3137 19 27 16.3137 27 13C27 9.68629 24.3137 7 21 7C17.6863 7 15 9.68629 15 13C15 16.3137 17.6863 19 21 19ZM10 30C13.3137 30 16 27.3137 16 24C16 20.6863 13.3137 18 10 18C6.68629 18 4 20.6863 4 24C4 27.3137 6.68629 30 10 30ZM38 24C38 27.3137 35.3137 30 32 30C28.6863 30 26 27.3137 26 24C26 20.6863 28.6863 18 32 18C35.3137 18 38 20.6863 38 24ZM21 26C22.1046 26 23 25.1046 23 24C23 22.8954 22.1046 22 21 22C19.8954 22 19 22.8954 19 24C19 25.1046 19.8954 26 21 26ZM27 35C27 38.3137 24.3137 41 21 41C17.6863 41 15 38.3137 15 35C15 31.6863 17.6863 29 21 29C24.3137 29 27 31.6863 27 35Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

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
      {/* Глобальный спиннер, центрированный по всей карточке */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <FilmSpinner className="w-10 h-10 md:w-12 md:h-12 text-muted-foreground/50" />
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

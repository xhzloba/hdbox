import React, { useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";

const MovieCardWithSkeleton = ({
  movie,
  onAdultContentClick,
  onMovieClick,
  isNew = false,
  showContentTypeBadge = false,
  position = null,
  showPosition = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isReady, setIsReady] = useState(false); // когда true — показываем контент

  useEffect(() => {
    if (imageLoaded && !isReady) {
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 220); // длительность fade-out скелетона
      return () => clearTimeout(timer);
    }
  }, [imageLoaded, isReady]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Показываем карточку даже если изображение не загрузилось
  };

  // Если изображение еще не загрузилось, показываем скелетон + предзагрузку
  if (!imageLoaded && !imageError) {
    return (
      <>
        <MovieCardSkeleton />
        {/* Предзагружаем изображение в фоне */}
        <img
          src={movie.poster || "https://kinohost.web.app/no_poster.png"}
          alt={movie.title}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: "none" }}
        />
      </>
    );
  }

  // Переходный этап: мягко скрываем скелетон (fade-out)
  if (!isReady) {
    return (
      <MovieCardSkeleton className="animate-fade-out" />
    );
  }

  // Когда изображение загрузилось и переход завершен — показываем карточку (fade-in)
  return (
    <div className="animate-fade-in">
      <MovieCard
        movie={movie}
        onAdultContentClick={onAdultContentClick}
        onMovieClick={onMovieClick}
        isNew={isNew}
        showContentTypeBadge={showContentTypeBadge}
        position={position}
        showPosition={showPosition}
      />
    </div>
  );
};

export default MovieCardWithSkeleton;

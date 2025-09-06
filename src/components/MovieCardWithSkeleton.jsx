import React, { useState } from "react";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "./MovieCardSkeleton";

const MovieCardWithSkeleton = ({
  movie,
  onAdultContentClick,
  onMovieClick,
  isNew = false,
  showContentTypeBadge = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true); // Показываем карточку даже если изображение не загрузилось
  };

  // Если изображение еще не загрузилось, показываем скелетон
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

  // Когда изображение загрузилось, показываем настоящую карточку
  return (
    <MovieCard
      movie={movie}
      onAdultContentClick={onAdultContentClick}
      onMovieClick={onMovieClick}
      isNew={isNew}
      showContentTypeBadge={showContentTypeBadge}
    />
  );
};

export default MovieCardWithSkeleton;

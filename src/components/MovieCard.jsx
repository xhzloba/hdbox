"use client";

import { useState, useContext, memo } from "react";
import {
  Play,
  Plus,
  Check,
  ThumbsDown,
  Meh,
  ThumbsUp,
  Zap,
  Lock,
  Unlock,
} from "lucide-react";
import { useFavorites } from "../contexts/FavoritesContext";
import { useParentalControl } from "../contexts/ParentalControlContext";
import SettingsContext from "../contexts/SettingsContext";
import PlayerModal from "./PlayerModal";

// Функция для определения иконки и цвета на основе рейтинга
const getRatingIcon = (rating) => {
  const numRating = parseFloat(rating);

  if (numRating < 5.5) {
    return {
      icon: ThumbsDown,
      color: "text-red-500",
    };
  } else if (numRating >= 5.6 && numRating < 7.5) {
    return {
      icon: Meh,
      color: "text-gray-200",
    };
  } else if (numRating >= 7.5 && numRating < 8.3) {
    return {
      icon: ThumbsUp,
      color: "text-green-500",
    };
  } else if (numRating >= 8.3 && numRating <= 10) {
    return {
      icon: Zap,
      color: "text-green-400",
    };
  }

  return null;
};

const MovieCard = ({
  movie,
  onAdultContentClick,
  onMovieClick,
  className = "",
  isNew = false,
  showAllGenres = false,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    isInFavoritesOrPending,
  } = useFavorites();
  // Безопасное использование useParentalControl с проверкой контекста
  let isParentalControlEnabled = false;
  let isAdultContent = () => false;
  let canAccessAdultContent = () => true;
  let isMovieUnlocked = () => true;
  
  try {
    const parentalControl = useParentalControl();
    isParentalControlEnabled = parentalControl.isParentalControlEnabled;
    isAdultContent = parentalControl.isAdultContent;
    canAccessAdultContent = parentalControl.canAccessAdultContent;
    isMovieUnlocked = parentalControl.isMovieUnlocked;
  } catch (error) {
    // Контекст недоступен, используем значения по умолчанию
    console.warn('ParentalControlContext not available, using defaults');
  }
  const settingsContext = useContext(SettingsContext);
  const showDetails = settingsContext?.showDetails ?? true; // По умолчанию показываем детали
  const showRatingAsIcons = settingsContext?.showRatingAsIcons ?? true; // По умолчанию показываем иконки
  const isInFavorites = isInFavoritesOrPending(movie.id);
  const isAdult = isAdultContent(movie.age);
  const isUnlocked = isMovieUnlocked(movie.id);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleAddToFavorites = (e) => {
    e.stopPropagation();
    // Проверяем реальное состояние favorites, а не pending
    if (isFavorite(movie.id)) {
      removeFromFavorites(movie.id);
    } else {
      addToFavorites(movie, e.currentTarget);
    }
  };

  const handleCardClick = () => {
    // Если передан onMovieClick (например, для поисковой модалки), используем его
    if (onMovieClick) {
      onMovieClick(movie);
      return;
    }

    // Стандартная логика для обычных карточек
    // Если контент 18+ и родительский контроль включен, но фильм разблокирован - открываем модалку плеера
    if (isAdult && isParentalControlEnabled && isUnlocked) {
      setIsPlayerModalOpen(true);
      return;
    }

    // Если контент 18+ и родительский контроль включен, показываем диалог с PIN
    if (
      isAdult &&
      isParentalControlEnabled &&
      !canAccessAdultContent(movie.age)
    ) {
      if (onAdultContentClick) {
        onAdultContentClick(movie);
      }
      return;
    }
    // Открываем модалку выбора плеера для обычного контента
    setIsPlayerModalOpen(true);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative overflow-hidden transition-all duration-300 cursor-pointer flex flex-col ${
        showDetails
          ? "bg-card rounded-lg h-[200px] md:h-[390px] w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px]"
          : "w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px] aspect-[2/3] rounded-lg"
      } ${
        isNew
          ? "border-2 border-yellow-400 shadow-lg shadow-yellow-400/20 animate-pulse hover:border-yellow-300 hover:shadow-yellow-300/30 animate-[fadeInScale_0.6s_ease-out]"
          : "border border-transparent hover:border-gray-600"
      }`}
      style={
        isNew
          ? {
              animation: "fadeInScale 0.6s ease-out, pulse 2s infinite",
            }
          : {}
      }
    >
      <div
        className={`relative overflow-hidden ${
          showDetails ? "h-[200px] md:h-[270px]" : "w-full h-full"
        }`}
      >
        {/* Placeholder/Skeleton пока изображение загружается */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-muted animate-pulse" />
        )}

        <img
          src={movie.poster || "https://kinohost.web.app/no_poster.png"}
          alt={movie.title}
          className={`w-full h-full object-cover group-hover:scale-110 transition-all duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          onError={(e) => {
            e.target.src = "https://kinohost.web.app/no_poster.png";
            setImageLoaded(true); // Показываем изображение даже если это fallback
          }}
        />

        {/* NEW Badge */}
        {isNew && (
          <div className="absolute top-2 left-2 z-30">
            <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
              NEW
            </div>
          </div>
        )}

        {/* Age Rating on Poster */}
        {movie.age && (
          <div
            className={`absolute bottom-2 z-20 ${isNew ? "right-2" : "left-2"}`}
          >
            <span className="text-xs font-medium text-gray-400 drop-shadow-lg">
              {movie.age}+
            </span>
          </div>
        )}

        {/* Blocked Content Overlay */}
        {isAdult && isParentalControlEnabled && !isUnlocked && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10">
            <div className="flex flex-col items-center space-y-2 animate-pulse">
              <Lock className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-lg" />
              <span className="text-white font-bold text-lg md:text-2xl drop-shadow-lg">
                18+
              </span>
            </div>
          </div>
        )}

        {/* Normal Hover Overlay */}
        {!(isAdult && isParentalControlEnabled && !isUnlocked) && (
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlayerModalOpen(true);
              }}
              className="p-2 bg-primary rounded-full hover:bg-primary/80 transition-colors"
            >
              <Play className="w-4 h-4 text-primary-foreground fill-current" />
            </button>
          </div>
        )}

        {/* Rating Display */}
        {movie.showRating && movie.rating && (
          <div className="absolute top-2 right-2">
            {showRatingAsIcons && getRatingIcon(movie.rating) ? (
              (() => {
                const { icon: IconComponent, color } = getRatingIcon(
                  movie.rating
                );
                return (
                  <div className="bg-black/70 rounded-full p-1.5 flex items-center justify-center">
                    <IconComponent className={`w-4 h-4 ${color}`} />
                  </div>
                );
              })()
            ) : (
              <div className="bg-black/70 rounded px-2 py-1 flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {parseFloat(movie.rating).toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Кнопка Plus/Check в углу карточки - показывается только если включены детали */}
      {showDetails && (
        <button
          onClick={handleAddToFavorites}
          className={`absolute bottom-2 right-2 w-6 h-6 rounded-full hidden md:flex items-center justify-center transition-colors ${
            isInFavorites
              ? "bg-green-500 hover:bg-green-600"
              : "bg-primary hover:bg-primary/80"
          }`}
        >
          {isInFavorites ? (
            <Check className="w-3 h-3 text-white" />
          ) : (
            <Plus className="w-3 h-3 text-primary-foreground" />
          )}
        </button>
      )}

      {/* Текстовый блок с информацией о фильме - показывается только если включены детали */}
      {showDetails && (
        <div className="p-2 md:p-3 hidden md:block">
          <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
            {movie.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{movie.year}</span>
            <span className="text-xs px-2 py-1 bg-secondary rounded text-gray-500">
              {Array.isArray(movie.genre)
                ? showAllGenres
                  ? movie.genre.join(", ")
                  : movie.genre[0] || movie.genre
                : movie.genre}
            </span>
          </div>
        </div>
      )}

      {/* Модальное окно плеера */}
      <PlayerModal
        movie={movie}
        isOpen={isPlayerModalOpen}
        onClose={() => setIsPlayerModalOpen(false)}
      />
    </div>
  );
};

export default memo(MovieCard);

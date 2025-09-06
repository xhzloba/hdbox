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

// Функция для определения типа контента
const getContentType = (type) => {
  if (!type) return null;
  
  const typeStr = type.toString().toLowerCase();
  
  if (typeStr.includes('movie') || typeStr.includes('multfilm')) {
    return 'Фильм';
  } else if (typeStr.includes('serial') || typeStr.includes('tv')) {
    return 'Сериал';
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
  showContentTypeBadge = false,
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
  const showFavoriteButton = settingsContext?.showFavoriteButton ?? true; // По умолчанию показываем кнопку избранного
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
            className={`absolute bottom-2 z-20 ${isNew ? "right-12" : "left-2"}`}
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
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlayerModalOpen(true);
                }}
                className="p-2 bg-primary rounded-full hover:bg-primary/80 transition-colors"
              >
                <Play className="w-4 h-4 text-primary-foreground fill-current" />
              </button>
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  // Функция поделиться - можно добавить модалку или нативный share API
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: movie.title,
                        text: `Посмотри ${movie.title} - отличный ${movie.type === 'series' ? 'сериал' : 'фильм'}!`,
                        url: window.location.href
                      });
                    } catch (error) {
                      // Игнорируем ошибку отмены пользователем
                      if (error.name === 'AbortError' || error.message.includes('canceled') || error.message.includes('cancelled')) {
                        return; // Просто игнорируем, не показываем ошибку
                      }
                      // Для других ошибок используем fallback
                      navigator.clipboard.writeText(`${movie.title} - ${window.location.href}`);
                    }
                  } else {
                    // Fallback - копирование в буфер обмена
                    navigator.clipboard.writeText(`${movie.title} - ${window.location.href}`);
                    // Можно добавить toast уведомление
                  }
                }}
                className="p-2 bg-primary rounded-full hover:bg-primary/80 transition-colors"
              >
                <svg 
                  className="w-4 h-4 text-primary-foreground" 
                  fill="currentColor" 
                  viewBox="0 0 48 48" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M25.5 5.745L30.885 11.115L33 9L24 0L15 9L17.115 11.115L22.5 5.745V27H25.5V5.745Z" fill="currentColor"></path>
                  <path d="M5 17V40C5 40.7956 5.31607 41.5587 5.87868 42.1213C6.44129 42.6839 7.20435 43 8 43H40C40.7956 43 41.5587 42.6839 42.1213 42.1213C42.6839 41.5587 43 40.7957 43 40V17C43 16.2043 42.6839 15.4413 42.1213 14.8787C41.5587 14.3161 40.7957 14 40 14H35.5V17H40V40H8L8 17H12.5V14L8 14C7.20435 14 6.44129 14.3161 5.87868 14.8787C5.31607 15.4413 5 16.2043 5 17Z" fill="currentColor"></path>
                </svg>
              </button>
            </div>
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

      {/* Ленточка избранного в левом верхнем углу постера */}
      <button
        onClick={handleAddToFavorites}
        className={`absolute top-2 left-2 z-30 group/ribbon transition-all duration-200 hover:scale-105 ${
          showFavoriteButton 
            ? "opacity-100" 
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
          <svg 
            className="w-7 h-10" 
            width="28" 
            height="40" 
            viewBox="0 0 28 40" 
            xmlns="http://www.w3.org/2000/svg" 
            role="presentation"
          >
            {/* Основной полигон ленточки */}
            <polygon 
              className={`transition-colors duration-200 ${
                isInFavorites 
                  ? "fill-sidebar-primary group-hover/ribbon:fill-sidebar-primary/80" 
                  : "fill-gray-700 opacity-60 group-hover/ribbon:opacity-80"
              }`}
              points="28 0 0 0 0 38 14.2843 30.4308 28 37.2353"
            />
            {/* Полигон для тени */}
            <polygon 
              className="fill-black/20" 
              points="28 37.2353 28 39.2353 14.2843 32.4308 0 40 0 38 14.2843 30.4308"
            />
          </svg>
          {/* Иконка внутри ленточки */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
            {isInFavorites ? (
              <Check className="w-3.5 h-3.5 text-white" />
            ) : (
              <Plus className="w-3.5 h-3.5 text-white" />
            )}
          </div>
        </button>

      {/* Текстовый блок с информацией о фильме - показывается только если включены детали */}
      {showDetails && (
        <div className="p-2 md:p-3 hidden md:block">
          <h3 className="text-sm font-medium text-foreground mb-1 line-clamp-1">
            {movie.title}
          </h3>
          <div className="text-xs text-muted-foreground">
            <div className="flex items-center gap-2 flex-wrap">
              <span>{movie.year}</span>
              <span className="text-xs px-2 py-1 bg-secondary rounded text-gray-500">
                {Array.isArray(movie.genre)
                  ? showAllGenres
                    ? movie.genre.join(", ")
                    : movie.genre[0] || movie.genre
                  : movie.genre}
              </span>
            </div>
            {getContentType(movie.type) && showContentTypeBadge && (
              <div className="mt-1">
                <span className="text-[10px] px-1.5 py-1 bg-white text-black rounded font-medium">
                  {getContentType(movie.type)}
                </span>
              </div>
            )}
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

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

// Функция для определения цвета обводки на основе рейтинга
const getBorderColor = (rating) => {
  if (!rating) return "rgb(156, 163, 175)"; // gray-400 - как для среднего рейтинга

  const numRating = parseFloat(rating);

  if (numRating < 5.5) {
    return "rgb(239, 68, 68)"; // red-500
  } else if (numRating >= 5.6 && numRating < 7.5) {
    return "rgb(156, 163, 175)"; // gray-400
  } else if (numRating >= 7.5 && numRating < 8.3) {
    return "rgb(34, 197, 94)"; // green-500
  } else if (numRating >= 8.3 && numRating <= 10) {
    return "rgb(74, 222, 128)"; // green-400
  }

  return "rgb(156, 163, 175)"; // gray-400 - fallback как для среднего рейтинга
};

// Функция для получения цвета рейтинга (для кругового индикатора)
const getRatingColor = (rating) => {
  if (!rating) return "#9ca3af"; // gray-400

  const numRating = parseFloat(rating);

  if (numRating < 5.5) {
    return "#ef4444"; // red-500
  } else if (numRating >= 5.6 && numRating < 7.5) {
    return "#9ca3af"; // gray-400
  } else if (numRating >= 7.5 && numRating < 8.3) {
    return "#22c55e"; // green-500
  } else if (numRating >= 8.3 && numRating <= 10) {
    return "#4ade80"; // green-400
  }

  return "#9ca3af"; // gray-400
};

// Компонент кругового рейтинга
const CircularRating = ({ rating, size = 32 }) => {
  if (!rating) return null;

  const numRating = parseFloat(rating);
  const percentage = Math.round(numRating * 10); // Конвертируем в проценты (6.8 -> 68)
  const radius = size / 2 - 4; // радиус с учетом отступа от краев
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const color = getRatingColor(rating);

  return (
    <div
      className="relative flex items-center justify-center bg-black/70 rounded-full shadow-lg"
      style={{
        width: size,
        height: size,
        boxShadow:
          "0 4px 12px rgba(0, 0, 0, 0.6), 0 2px 4px rgba(0, 0, 0, 0.4)",
      }}
    >
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Фоновый круг */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="3"
          fill="transparent"
        />
        {/* Прогресс круг */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      {/* Текст в центре */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-white font-bold text-xs"
          style={{ fontSize: size > 32 ? "10px" : "8px" }}
        >
          {percentage}%
        </span>
      </div>
    </div>
  );
};

// Функция для определения типа контента
const getContentType = (type) => {
  if (!type) return null;

  const typeStr = type.toString().toLowerCase();

  if (typeStr.includes("movie") || typeStr.includes("multfilm")) {
    return "Фильм";
  } else if (typeStr.includes("serial") || typeStr.includes("tv")) {
    return "Сериал";
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
  position = null,
  showPosition = false,
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
    console.warn("ParentalControlContext not available, using defaults");
  }
  const settingsContext = useContext(SettingsContext);
  const showDetails = settingsContext?.showDetails ?? true; // По умолчанию показываем детали
  const showRatingAsIcons = settingsContext?.showRatingAsIcons ?? true; // По умолчанию показываем иконки
  const showFavoriteButton = settingsContext?.showFavoriteButton ?? true; // По умолчанию показываем кнопку избранного
  const cardShadowsEnabled = settingsContext?.cardShadowsEnabled ?? true; // По умолчанию показываем тени
  const coloredHoverEnabled = settingsContext?.coloredHoverEnabled ?? false; // По умолчанию отключено цветное затемнение
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
          ? `border-2 border-yellow-400 ${
              cardShadowsEnabled ? "shadow-lg shadow-yellow-400/20" : ""
            } animate-pulse hover:border-yellow-300 ${
              cardShadowsEnabled ? "hover:shadow-yellow-300/30" : ""
            } animate-[fadeInScale_0.6s_ease-out]`
          : "border border-transparent hover:border-gray-600"
      }`}
      style={{
        ...(cardShadowsEnabled ? { boxShadow: "6px 5px 7px black" } : {}),
        ...(isNew
          ? {
              animation: "fadeInScale 0.6s ease-out, pulse 2s infinite",
            }
          : {}),
      }}
      onMouseEnter={(e) => {
        if (coloredHoverEnabled && !isNew) {
          e.currentTarget.style.borderColor = getBorderColor(movie.rating);
        }
      }}
      onMouseLeave={(e) => {
        if (coloredHoverEnabled && !isNew) {
          e.currentTarget.style.borderColor = "";
        }
      }}
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
            className={`absolute bottom-2 z-20 ${
              showPosition && position && position <= 10
                ? "right-2"
                : isNew
                ? "right-12"
                : "left-2"
            }`}
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

        {/* Normal Hover Overlay - только кнопка плей */}
        {!(isAdult && isParentalControlEnabled && !isUnlocked) && (
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center"
            style={{
              background: (() => {
                // Если цветное затемнение отключено, всегда используем черное
                if (!coloredHoverEnabled) {
                  return "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)";
                }

                if (!movie.rating)
                  return "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)";

                const numRating = parseFloat(movie.rating);

                if (numRating < 5.5) {
                  // Красноватое для плохих фильмов
                  return "linear-gradient(to top, rgba(139,0,0,0.7) 0%, rgba(139,0,0,0.4) 50%, transparent 100%)";
                } else if (numRating >= 5.6 && numRating < 7.5) {
                  // Серое для средних
                  return "linear-gradient(to top, rgba(75,85,99,0.7) 0%, rgba(75,85,99,0.4) 50%, transparent 100%)";
                } else if (numRating >= 7.5 && numRating < 8.3) {
                  // Зеленоватое для хороших
                  return "linear-gradient(to top, rgba(34,139,34,0.7) 0%, rgba(34,139,34,0.4) 50%, transparent 100%)";
                } else if (numRating >= 8.3 && numRating <= 10) {
                  // Яркое зеленое для шедевров
                  return "linear-gradient(to top, rgba(50,205,50,0.7) 0%, rgba(50,205,50,0.4) 50%, transparent 100%)";
                }

                return "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, transparent 100%)";
              })(),
            }}
          >
            <div className="transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlayerModalOpen(true);
                }}
                className="p-2.5 bg-primary rounded-full hover:bg-primary/90 hover:scale-105 transition-all duration-200 shadow-lg shadow-primary/30"
              >
                <Play className="w-5 h-5 text-primary-foreground fill-current" />
              </button>
            </div>
          </div>
        )}

        {/* Кнопка поделиться в нижнем правом углу */}
        {!(isAdult && isParentalControlEnabled && !isUnlocked) && (
          <button
            onClick={async (e) => {
              e.stopPropagation();

              // Детальная отладочная информация
              console.log("=== Share Button Debug Info ===");
              console.log("Browser:", navigator.userAgent);
              console.log("navigator.share supported:", !!navigator.share);
              console.log("Protocol:", window.location.protocol);
              console.log("Host:", window.location.host);
              console.log("Movie data:", {
                title: movie.title,
                year: movie.year,
                type: movie.type,
              });

              // Формируем данные для sharing
              const titleWithYear = movie.year
                ? `${movie.title} (${movie.year})`
                : movie.title;
              const shareText = movie.year
                ? `Посмотри ${movie.title} (${movie.year}) - отличный ${
                    movie.type === "series" ? "сериал" : "фильм"
                  }!`
                : `Посмотри ${movie.title} - отличный ${
                    movie.type === "series" ? "сериал" : "фильм"
                  }!`;

              const shareData = {
                title: titleWithYear,
                text: shareText,
                url: window.location.href,
              };

              console.log("Share data:", shareData);

              // Приоритет Web Share API - используем если доступен, независимо от протокола
              if (navigator.share) {
                try {
                  console.log("Attempting to share via Web Share API...");
                  await navigator.share(shareData);
                  console.log("✅ Share successful via Web Share API");
                  // НЕ показываем alert - нативный UI уже показал результат
                } catch (error) {
                  console.log("Share error:", error.name, error.message);
                  // Игнорируем ошибку отмены пользователем
                  if (
                    error.name === "AbortError" ||
                    error.message.includes("canceled") ||
                    error.message.includes("cancelled")
                  ) {
                    console.log("Share cancelled by user - this is normal");
                    return;
                  }
                  // Для других ошибок используем fallback
                  console.log("Using fallback due to Web Share API error");
                  const fallbackText = movie.year
                    ? `${movie.title} (${movie.year}) - ${window.location.href}`
                    : `${movie.title} - ${window.location.href}`;
                  try {
                    await navigator.clipboard.writeText(fallbackText);
                    alert("📋 Ссылка скопирована в буфер обмена!");
                  } catch (clipboardError) {
                    console.error("Clipboard error:", clipboardError);
                    alert("❌ Ошибка при копировании в буфер обмена");
                  }
                }
              } else {
                // Fallback - копирование в буфер обмена
                console.log(
                  "Web Share API not supported, using clipboard fallback"
                );
                const fallbackText = movie.year
                  ? `${movie.title} (${movie.year}) - ${window.location.href}`
                  : `${movie.title} - ${window.location.href}`;
                try {
                  await navigator.clipboard.writeText(fallbackText);
                  alert("📋 Ссылка скопирована в буфер обмена!");
                } catch (clipboardError) {
                  console.error("Clipboard error:", clipboardError);
                  // Последний fallback - показываем текст для ручного копирования
                  prompt("Скопируйте ссылку вручную:", fallbackText);
                }
              }
              console.log("=== End Share Debug ===");
            }}
            className="absolute bottom-2 right-2 z-20 p-2 bg-primary rounded-full hover:bg-primary/80 transition-all duration-300 hover:scale-105 opacity-0 group-hover:opacity-100"
          >
            <svg
              className="w-4 h-4 text-primary-foreground"
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M25.5 5.745L30.885 11.115L33 9L24 0L15 9L17.115 11.115L22.5 5.745V27H25.5V5.745Z"
                fill="currentColor"
              ></path>
              <path
                d="M5 17V40C5 40.7956 5.31607 41.5587 5.87868 42.1213C6.44129 42.6839 7.20435 43 8 43H40C40.7956 43 41.5587 42.6839 42.1213 42.1213C42.6839 41.5587 43 40.7957 43 40V17C43 16.2043 42.6839 15.4413 42.1213 14.8787C41.5587 14.3161 40.7957 14 40 14H35.5V17H40V40H8L8 17H12.5V14L8 14C7.20435 14 6.44129 14.3161 5.87868 14.8787C5.31607 15.4413 5 16.2043 5 17Z"
                fill="currentColor"
              ></path>
            </svg>
          </button>
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
                  <div
                    className="bg-black/70 rounded-full p-1.5 flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))",
                      boxShadow:
                        "rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset",
                      borderTop: "1px solid rgb(84, 84, 84)",
                    }}
                  >
                    <IconComponent className={`w-4 h-4 ${color}`} />
                  </div>
                );
              })()
            ) : (
              // Если рейтинг иконками выключен, показываем круговой рейтинг
              <CircularRating rating={movie.rating} size={44} />
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
          {/* Основной блок с позицией и информацией */}
          <div className="grid grid-cols-[auto_1fr] gap-2 mb-1">
            {/* Позиция слева, занимает высоту всего блока */}
            {showPosition && position && position <= 10 && (
              <div
                className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 bg-clip-text text-transparent self-center"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  textShadow:
                    "0 2px 4px rgba(0,0,0,0.3), 0 4px 8px rgba(0,0,0,0.2), 0 1px 0px rgba(255,255,255,0.8)",
                  letterSpacing: "0.02em",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                }}
              >
                {position}
              </div>
            )}

            {/* Колонка с информацией справа */}
            <div className="flex flex-col justify-center">
              <h3 className="text-sm font-medium text-foreground line-clamp-1 mb-1">
                {movie.title}
              </h3>
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-0.5 flex-wrap">
                  {movie.year && (
                    <span className="text-xs pr-2 py-0.5 bg-secondary rounded text-gray-500 leading-tight">
                      {movie.year}
                    </span>
                  )}
                  <span className="text-xs pr-1 py-0.5 bg-secondary rounded text-gray-500 leading-tight">
                    {Array.isArray(movie.genre)
                      ? showAllGenres
                        ? movie.genre.slice(0, 2).join(", ")
                        : movie.genre[0] || movie.genre
                      : movie.genre}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Бейджик типа контента под всем блоком */}
          {getContentType(movie.type) && showContentTypeBadge && (
            <div>
              {getContentType(movie.type) === "Фильм" ? (
                <div className="flex items-center gap-1">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0"
                    fill="currentColor"
                    height="48"
                    viewBox="0 0 48 48"
                    width="48"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M42 24C42 31.2328 38.3435 37.6115 32.7782 41.3886C33.1935 41.2738 33.602 41.1447 34 41C45.1693 36.9384 47 32 47 32L48 35C48 35 44.3832 40.459 34.5 43.5C28 45.5 21 45 21 45C9.40202 45 0 35.598 0 24C0 12.402 9.40202 3 21 3C32.598 3 42 12.402 42 24ZM21 19C24.3137 19 27 16.3137 27 13C27 9.68629 24.3137 7 21 7C17.6863 7 15 9.68629 15 13C15 16.3137 17.6863 19 21 19ZM10 30C13.3137 30 16 27.3137 16 24C16 20.6863 13.3137 18 10 18C6.68629 18 4 20.6863 4 24C4 27.3137 6.68629 30 10 30ZM38 24C38 27.3137 35.3137 30 32 30C28.6863 30 26 27.3137 26 24C26 20.6863 28.6863 18 32 18C35.3137 18 38 20.6863 38 24ZM21 26C22.1046 26 23 25.1046 23 24C23 22.8954 22.1046 22 21 22C19.8954 22 19 22.8954 19 24C19 25.1046 19.8954 26 21 26ZM27 35C27 38.3137 24.3137 41 21 41C17.6863 41 15 38.3137 15 35C15 31.6863 17.6863 29 21 29C24.3137 29 27 31.6863 27 35Z"
                      fill="currentColor"
                      fillRule="evenodd"
                    ></path>
                  </svg>
                  <span className="text-[10px] px-1.5 py-1 text-gray-200 font-medium">
                    фильм
                  </span>
                </div>
              ) : (
                <span className="text-[10px] px-1.5 py-1 bg-gray-600/70 text-gray-200 rounded font-medium">
                  {getContentType(movie.type)}
                </span>
              )}
            </div>
          )}
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

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useToast } from "../../hooks/use-toast";

const FavoritesContext = createContext();

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within a FavoritesProvider");
  }
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [animatingMovie, setAnimatingMovie] = useState(null);
  const [pendingMovie, setPendingMovie] = useState(null);
  const [pendingFavorites, setPendingFavorites] = useState(new Set());
  const { toast } = useToast();

  // Загрузка избранного из localStorage при инициализации
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem("streamflix-favorites");
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (error) {
      console.error("Error loading favorites from localStorage:", error);
    }
  }, []);

  // Сохранение в localStorage при изменении избранного
  useEffect(() => {
    try {
      localStorage.setItem("streamflix-favorites", JSON.stringify(favorites));
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  }, [favorites]);

  const addToFavorites = (movie, sourceElement) => {
    if (!isFavorite(movie.id) && !pendingFavorites.has(movie.id)) {
      // Мгновенно добавляем в pending для UI
      setPendingFavorites((prev) => new Set([...prev, movie.id]));

      // Запускаем анимацию, но не обновляем счетчик сразу
      if (sourceElement) {
        setPendingMovie(movie);
        // Находим родительскую карточку фильма для более точного позиционирования
        const movieCard = sourceElement.closest(".group");
        const rect = movieCard
          ? movieCard.getBoundingClientRect()
          : sourceElement.getBoundingClientRect();
        setAnimatingMovie({
          movie,
          startX: rect.left + rect.width / 2,
          startY: rect.top + rect.height / 2,
          poster: movie.poster,
        });

        // Анимация будет сброшена через onAnimationComplete
      } else {
        // Если нет анимации, добавляем сразу
        setFavorites((prev) => [...prev, movie]);
        setPendingFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(movie.id);
          return newSet;
        });
      }
    }
  };

  const removeFromFavorites = (movieId) => {
    const removedMovie = favorites.find((movie) => movie.id === movieId);
    setFavorites((prev) => prev.filter((movie) => movie.id !== movieId));
    // Также убираем из pending если там есть
    setPendingFavorites((prev) => {
      const newSet = new Set(prev);
      newSet.delete(movieId);
      return newSet;
    });
  };

  const isFavorite = (movieId) => {
    return favorites.some((movie) => movie.id === movieId);
  };

  const isPendingFavorite = (movieId) => {
    return pendingFavorites.has(movieId);
  };

  const isInFavoritesOrPending = (movieId) => {
    return isFavorite(movieId) || isPendingFavorite(movieId);
  };

  const getFavoritesCount = () => {
    return favorites.length;
  };

  const clearFavorites = () => {
    const count = favorites.length;
    setFavorites([]);

    if (count > 0) {
      toast({
        title: "Избранное очищено",
        description: `Удалено ${count} ${
          count === 1 ? "фильм" : count < 5 ? "фильма" : "фильмов"
        } из избранного.`,
        duration: 3000,
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  };

  // Колбэк для завершения анимации
  const onAnimationComplete = useCallback(() => {
    console.log("onAnimationComplete called, pendingMovie:", pendingMovie);
    if (pendingMovie) {
      setFavorites((prev) => [...prev, pendingMovie]);
      // Убираем из pending после добавления в favorites
      setPendingFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(pendingMovie.id);
        return newSet;
      });

      // Toast уведомление убрано по запросу пользователя

      setPendingMovie(null);
    }
    // Сбрасываем animatingMovie для разрешения новых анимаций
    setAnimatingMovie(null);
  }, [pendingMovie]);

  const value = {
    favorites,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    isPendingFavorite,
    isInFavoritesOrPending,
    getFavoritesCount,
    clearFavorites,
    animatingMovie,
    onAnimationComplete,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;

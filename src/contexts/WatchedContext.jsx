"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useToast } from "../../hooks/use-toast";

const WatchedContext = createContext();

export const useWatched = () => {
  const context = useContext(WatchedContext);
  if (!context) {
    throw new Error("useWatched must be used within a WatchedProvider");
  }
  return context;
};

export const WatchedProvider = ({ children }) => {
  const [watched, setWatched] = useState([]);
  const [animatingMovie, setAnimatingMovie] = useState(null);
  const [pendingMovie, setPendingMovie] = useState(null);
  const [pendingWatched, setPendingWatched] = useState(new Set());
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Загрузка просмотренных из localStorage при инициализации
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    try {
      const savedWatched = localStorage.getItem("hdbox-watched");
      if (savedWatched) {
        setWatched(JSON.parse(savedWatched));
      }
    } catch (error) {
      console.error("Error loading watched from localStorage:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Сохранение в localStorage при изменении просмотренных
  useEffect(() => {
    if (!isInitialized || typeof window === "undefined") return;
    
    try {
      localStorage.setItem("hdbox-watched", JSON.stringify(watched));
    } catch (error) {
      console.error("Error saving watched to localStorage:", error);
    }
  }, [watched, isInitialized]);

  const addToWatched = (movie, sourceElement) => {
    console.log("addToWatched called with movie:", movie.title, "id:", movie.id);
    console.log("isWatched:", isWatched(movie.id), "pendingWatched:", pendingWatched.has(movie.id));
    
    if (!isWatched(movie.id) && !pendingWatched.has(movie.id)) {
      console.log("Adding movie to watched:", movie.title);
      // Мгновенно добавляем в pending для UI
      setPendingWatched((prev) => new Set([...prev, movie.id]));

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

        // Автоматически завершаем анимацию через 2 секунды если она не завершилась
        setTimeout(() => {
          console.log("Auto-completing animation for movie:", movie.title);
          setWatched((prev) => {
            // Проверяем что фильм еще не добавлен
            if (!prev.some(m => m.id === movie.id)) {
              return [movie, ...prev];
            }
            return prev;
          });
          setPendingWatched((prev) => {
            const newSet = new Set(prev);
            newSet.delete(movie.id);
            return newSet;
          });
          setPendingMovie(null);
          setAnimatingMovie(null);
        }, 2000);
      } else {
        // Если нет анимации, добавляем сразу в начало списка
        console.log("Adding movie directly to watched list");
        setWatched((prev) => [movie, ...prev]);
        setPendingWatched((prev) => {
          const newSet = new Set(prev);
          newSet.delete(movie.id);
          return newSet;
        });
      }
    } else {
      console.log("Movie already watched or pending:", movie.title);
    }
  };

  const removeFromWatched = (movieId) => {
    const removedMovie = watched.find((movie) => movie.id === movieId);
    setWatched((prev) => prev.filter((movie) => movie.id !== movieId));
    // Также убираем из pending если там есть
    setPendingWatched((prev) => {
      const newSet = new Set(prev);
      newSet.delete(movieId);
      return newSet;
    });
  };

  const isWatched = (movieId) => {
    return watched.some((movie) => movie.id === movieId);
  };

  const isPendingWatched = (movieId) => {
    return pendingWatched.has(movieId);
  };

  const isInWatchedOrPending = (movieId) => {
    return isWatched(movieId) || isPendingWatched(movieId);
  };

  const getWatchedCount = () => {
    return watched.length;
  };

  const clearWatched = () => {
    const count = watched.length;
    setWatched([]);

    if (count > 0) {
      toast({
        title: "Просмотренные очищены",
        description: `Удалено ${count} ${
          count === 1 ? "фильм" : count < 5 ? "фильма" : "фильмов"
        } из просмотренных.`,
        duration: 3000,
        className: "bg-red-50 border-red-200 text-red-800",
      });
    }
  };

  // Колбэк для завершения анимации
  const onAnimationComplete = useCallback(() => {
    console.log("onAnimationComplete called, pendingMovie:", pendingMovie);
    if (pendingMovie) {
      // Добавляем в начало списка
      setWatched((prev) => [pendingMovie, ...prev]);
      // Убираем из pending после добавления в watched
      setPendingWatched((prev) => {
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
    watched,
    addToWatched,
    removeFromWatched,
    isWatched,
    isPendingWatched,
    isInWatchedOrPending,
    getWatchedCount,
    clearWatched,
    animatingMovie,
    onAnimationComplete,
  };

  return (
    <WatchedContext.Provider value={value}>
      {children}
    </WatchedContext.Provider>
  );
};

export default WatchedContext;
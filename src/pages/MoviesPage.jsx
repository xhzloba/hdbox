"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import AdultContentDialog from "../components/AdultContentDialog";
import { useKids } from "../contexts/KidsContext";
import SettingsContext from "../contexts/SettingsContext";

const MoviesPage = () => {
  // Безопасное использование useKids с проверкой на существование контекста
  let isKidsMode = false;
  try {
    const kidsContext = useKids();
    isKidsMode = kidsContext?.isKidsMode || false;
  } catch (error) {
    // Контекст недоступен при SSR/SSG, используем значение по умолчанию
    console.warn('KidsContext not available, using default value');
    isKidsMode = false;
  }
  const [activeTab, setActiveTab] = useState("updatings");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAdultMovie, setSelectedAdultMovie] = useState(null);
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const tabs = [
    {
      id: "updatings",
      title: "Обновления",
      url: "https://api.vokino.tv/v2/list?sort=updatings&type=movie",
    },
    {
      id: "new",
      title: "Новинки",
      url: "https://api.vokino.tv/v2/list?sort=new&type=movie",
    },
    {
      id: "popular",
      title: "Популярное",
      url: "https://api.vokino.tv/v2/list?sort=popular&type=movie",
    },
    {
      id: "rating",
      title: "Лучшее",
      url: "https://api.vokino.tv/v2/list?sort=rating&type=movie",
    },
  ];

  // Функция для удаления дубликатов фильмов по ID
  const removeDuplicates = useCallback((existingMovies, newMovies) => {
    const existingIds = new Set(
      existingMovies.map((movie) => movie.details.id)
    );
    const uniqueNewMovies = newMovies.filter(
      (movie) => !existingIds.has(movie.details.id)
    );

    const duplicatesCount = newMovies.length - uniqueNewMovies.length;
    if (duplicatesCount > 0) {
      console.log(`Удалено ${duplicatesCount} дубликатов фильмов`);
    }

    return uniqueNewMovies;
  }, []);

  const fetchMovies = useCallback(
    async (tabId, pageNum = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const tab = tabs.find((t) => t.id === tabId);
        let allMovies = [];

        if (reset && pageNum === 1) {
          // При первой загрузке любого таба загружаем сразу 2 страницы
          const [page1Response, page2Response] = await Promise.all([
            fetch(`${tab.url}&page=1`),
            fetch(`${tab.url}&page=2`),
          ]);

          const [page1Data, page2Data] = await Promise.all([
            page1Response.json(),
            page2Response.json(),
          ]);

          if (page1Data.channels && page1Data.channels.length > 0) {
            allMovies = [...allMovies, ...page1Data.channels];
          }

          if (page2Data.channels && page2Data.channels.length > 0) {
            allMovies = [...allMovies, ...page2Data.channels];
          }

          setPage(2); // Устанавливаем страницу на 2, так как уже загрузили первые две

          // Проверяем, есть ли еще данные
          if (!page2Data.channels || page2Data.channels.length < 15) {
            setHasMore(false);
          }

          if (allMovies.length > 0) {
            const uniqueMovies = removeDuplicates([], allMovies);
            setMovies(uniqueMovies);
          } else {
            setMovies([]);
            setHasMore(false);
          }
        } else {
          // Обычная загрузка одной страницы
          const url = `${tab.url}&page=${pageNum}`;
          console.log("Fetching movies:", { tabId, pageNum, url });
          const response = await fetch(url);
          const data = await response.json();
          console.log("API Response:", {
            channels: data.channels?.length,
            hasMore: data.channels?.length >= 15,
          });

          if (data.channels && data.channels.length > 0) {
            if (reset) {
              setMovies(data.channels);
            } else {
              setMovies((prev) => {
                const uniqueNewMovies = removeDuplicates(prev, data.channels);
                console.log(
                  `Добавлено ${uniqueNewMovies.length} уникальных фильмов из ${data.channels.length}`
                );
                return [...prev, ...uniqueNewMovies];
              });
            }
            setHasMore(data.channels.length >= 15);
          } else {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("Error fetching movies:", error);
      } finally {
        setLoading(false);
        setHasAttemptedFetch(true);
      }
    },
    [loading, removeDuplicates]
  );

  useEffect(() => {
    // Ставим loading=true сразу, чтобы не мигал пустой экран
    setLoading(true);
    setHasAttemptedFetch(false);
    setMovies([]);
    setPage(1);
    setHasMore(true);
    // Используем setTimeout для обеспечения правильного порядка выполнения
    setTimeout(() => {
      fetchMovies(activeTab, 1, true);
    }, 0);
  }, [activeTab]); // Убираем fetchMovies из зависимостей

  const handleScroll = useCallback(() => {
    // Более надежное определение достижения конца страницы
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.offsetHeight;

    // Загружаем новую страницу за 200px до конца
    const threshold = 200;
    const isNearBottom = scrollTop + windowHeight >= documentHeight - threshold;

    console.log("Scroll debug:", {
      scrollTop,
      windowHeight,
      documentHeight,
      isNearBottom,
      loading,
      hasMore,
      currentPage: page,
      moviesCount: movies.length,
    });

    // Если активен поиск — минимизируем работу обработчика
    if (document?.documentElement?.dataset?.searchActive === "true") {
      return;
    }

    if (!isNearBottom || loading || !hasMore) {
      return;
    }

    const nextPage = page + 1;
    console.log("Loading next page:", nextPage);
    setPage(nextPage);
    fetchMovies(activeTab, nextPage, false);
  }, [activeTab, hasMore, loading, page, movies.length]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (document?.documentElement?.dataset?.searchActive === "true") return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  const handleTabClick = (tabId) => {
    if (tabId !== activeTab) {
      setActiveTab(tabId);
    }
  };

  const handleAdultContentClick = (movie) => {
    setSelectedAdultMovie(movie);
    setIsAdultDialogOpen(true);
  };

  const handleAdultDialogClose = () => {
    setIsAdultDialogOpen(false);
    setSelectedAdultMovie(null);
  };

  const handleAccessGranted = (movie) => {
    console.log("Доступ к контенту 18+ разрешен:", movie.title);
  };

  // Рассчитывает общий рейтинг на основе доступных рейтингов (как в слайдерах)
  const calculateRating = (rating_kp, rating_imdb, tmdb_rating) => {
    // Преобразуем все рейтинги в числа
    const kp = parseFloat(rating_kp) || 0;
    const imdb = parseFloat(rating_imdb) || 0;
    const tmdb = parseFloat(tmdb_rating) || 0;

    // Собираем все ненулевые рейтинги
    const validRatings = [kp, imdb, tmdb].filter((rating) => rating > 0);

    // Если нет валидных рейтингов - не показываем
    if (validRatings.length === 0) {
      return {
        rating: null,
        showRating: false,
      };
    }

    // Если только один рейтинг - показываем его
    if (validRatings.length === 1) {
      return {
        rating: validRatings[0].toFixed(1),
        showRating: true,
      };
    }

    // Если несколько рейтингов - рассчитываем средний
    const averageRating =
      validRatings.reduce((sum, rating) => sum + rating, 0) /
      validRatings.length;

    return {
      rating: averageRating.toFixed(1),
      showRating: true,
    };
  };

  // Преобразование данных из API в формат для MovieCard
  const transformMovieData = (apiMovie) => {
    // Сохраняем все жанры из строки или массива
    let allGenres = apiMovie.details.genre;
    if (Array.isArray(allGenres)) {
      // Если уже массив, оставляем как есть
      allGenres = allGenres;
    } else if (typeof allGenres === "string") {
      // Если строка, разбиваем по запятым и очищаем от пробелов
      allGenres = allGenres.split(",").map((genre) => genre.trim());
    }

    // Рассчитываем рейтинг на основе всех доступных источников (как в слайдерах)
    const ratingData = calculateRating(
      apiMovie.details.rating_kp,
      apiMovie.details.rating_imdb,
      apiMovie.details.tmdb_rating
    );

    return {
      id: apiMovie.details.id,
      ident: apiMovie.ident, // Добавляем ident для работы с плеерами
      title: apiMovie.details.name,
      poster: apiMovie.details.poster,
      year: apiMovie.details.released,
      genre: allGenres,
      rating: ratingData.rating,
      age: apiMovie.details.age,
      showRating: ratingData.showRating,
      type: "movie", // Добавляем тип для правильной фильтрации в избранном
      country: apiMovie.details.country, // Добавляем страну для фильтрации по странам в избранном
      description: apiMovie.details.about, // Добавляем описание для модалки плеера
    };
  };

  return (
    <div className="flex-1 px-6 lg:px-12 py-8">
      {/* Табы */}
      <div className="mb-6">
        <div
          className={`bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-1 ${
            isKidsMode ? "gap-2" : "gap-1"
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === tab.id
                  ? isKidsMode
                    ? "bg-pink-500 text-white shadow-sm"
                    : "bg-background text-foreground ring-2 ring-ring ring-offset-2"
                  : "hover:bg-background/50 hover:text-foreground"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* Контейнер с фильмами (виртуализированный по строкам) */}
      {loading && movies.length === 0 ? (
        <div
          className="flex flex-wrap gap-4 justify-start movie-grid"
          style={{ contain: "layout paint" }}
        >
          {Array.from({ length: 20 }, (_, index) => (
            <div
              key={`skeleton-${index}`}
              className="w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px]"
            >
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <VirtualizedMoviesGrid
          items={movies}
          transformItem={transformMovieData}
          onAdultContentClick={handleAdultContentClick}
        />
      )}

      {/* Индикатор загрузки при подгрузке */}
      {loading && movies.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Загрузка...</span>
        </div>
      )}

      <AdultContentDialog
        isOpen={isAdultDialogOpen}
        onClose={handleAdultDialogClose}
        movie={selectedAdultMovie}
        onAccessGranted={handleAccessGranted}
      />

      {/* Сообщение об окончании контента */}
      {!hasMore && movies.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">Больше фильмов нет</p>
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && movies.length === 0 && hasAttemptedFetch && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Фильмы не найдены</p>
        </div>
      )}
    </div>
  );
};

export default MoviesPage;

// Виртуализированный грид по строкам (простая реализация, без ломки верстки)
function VirtualizedMoviesGrid({ items, transformItem, onAdultContentClick }) {
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = React.useState(1024);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      // Игнорируем измерения во время анимации сайдбара, чтобы не триггерить перерасчёт рядов
      if (document?.documentElement?.dataset?.sidebarAnimating === "true") {
        return;
      }
      const w = containerRef.current?.getBoundingClientRect().width || 1024;
      setContainerWidth(w);
    };
    measure();
    // Лёгкий debounce для всплесков ресайза
    let debounceTimer = null;
    const debouncedMeasure = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(measure, 60);
    };
    const ro = new ResizeObserver(debouncedMeasure);
    ro.observe(containerRef.current);
    window.addEventListener("resize", debouncedMeasure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", debouncedMeasure);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, []);

  const settings = React.useContext(SettingsContext);
  const showDetails = settings?.showDetails ?? true;

  const cardWidth = containerWidth >= 768 ? 200 : 120; // соответствует классам w-[120px]/md:w-[200px]
  const gap = 16; // gap-4
  const cardsPerRow = Math.max(
    1,
    Math.floor((containerWidth + gap) / (cardWidth + gap))
  );
  const estimateRowHeight =
    containerWidth >= 768 ? (showDetails ? 406 : 316) : 200;
  const rowCount = Math.ceil(items.length / cardsPerRow);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimateRowHeight,
    overscan: 6,
  });

  // При изменении высоты строки/количества карточек в ряду пересчитать размеры
  React.useEffect(() => {
    virtualizer.measure();
  }, [virtualizer, estimateRowHeight, cardsPerRow]);

  const rows = virtualizer.getVirtualItems();

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        height: virtualizer.getTotalSize(),
        width: "100%",
        overflowX: "hidden",
      }}
    >
      <div style={{ transform: `translateY(${rows[0]?.start ?? 0}px)` }}>
        {rows.map((row) => {
          const startIndex = row.index * cardsPerRow;
          const rowItems = items.slice(startIndex, startIndex + cardsPerRow);
          return (
            <div
              key={row.key}
              data-index={row.index}
              style={{ height: row.size, width: "100%" }}
              className="flex flex-nowrap gap-4 justify-start px-0 w-full"
            >
              {rowItems.map((movie, idx) => (
                <div
                  key={`${movie.details.id}-${startIndex + idx}`}
                  className="w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px]"
                >
                  <MovieCard
                    movie={transformItem(movie)}
                    onAdultContentClick={onAdultContentClick}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

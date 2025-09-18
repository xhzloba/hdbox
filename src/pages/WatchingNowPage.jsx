"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import AdultContentDialog from "../components/AdultContentDialog";
import BackToTopButton from "../components/BackToTopButton";

import SettingsContext from "../contexts/SettingsContext";

const WatchingNowPage = () => {
  const settings = useContext(SettingsContext);
  const pageStylesEnabled = settings?.pageStylesEnabled ?? false;

  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAdultContent, setSelectedAdultContent] = useState(null);
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [positionChanges, setPositionChanges] = useState({});

  // Ключи для localStorage
  const STORAGE_KEY = "watching-now-positions";
  const STORAGE_TIMESTAMP_KEY = "watching-now-timestamp";

  // Функция для сохранения позиций в localStorage
  const savePositionsToStorage = useCallback((contentArray) => {
    try {
      const positions = {};
      contentArray.forEach((item, index) => {
        positions[item.details.id] = {
          position: index + 1,
          title: item.details.name,
          timestamp: Date.now(),
        };
      });

      localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
      localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
      console.log("Позиции сохранены в localStorage:", positions);
    } catch (error) {
      console.error("Ошибка сохранения позиций:", error);
    }
  }, []);

  // Функция для загрузки предыдущих позиций из localStorage
  const loadPreviousPositions = useCallback(() => {
    try {
      const savedPositions = localStorage.getItem(STORAGE_KEY);
      const savedTimestamp = localStorage.getItem(STORAGE_TIMESTAMP_KEY);

      if (savedPositions && savedTimestamp) {
        const positions = JSON.parse(savedPositions);
        const timestamp = parseInt(savedTimestamp);
        const now = Date.now();
        const hoursPassed = (now - timestamp) / (1000 * 60 * 60);

        // Используем данные только если они не старше 24 часов
        if (hoursPassed < 24) {
          console.log("Загружены предыдущие позиции:", positions);
          return positions;
        } else {
          console.log("Предыдущие позиции устарели, очищаем");
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STORAGE_TIMESTAMP_KEY);
        }
      }
    } catch (error) {
      console.error("Ошибка загрузки позиций:", error);
    }
    return {};
  }, []);

  // Функция для вычисления изменений позиций
  const calculatePositionChanges = useCallback(
    (newContentArray, previousPositions) => {
      const changes = {};

      newContentArray.forEach((item, index) => {
        const currentPosition = index + 1;
        const itemId = item.details.id;
        const previousData = previousPositions[itemId];

        if (previousData) {
          const previousPosition = previousData.position;
          const positionChange = previousPosition - currentPosition; // Положительное = поднялся, отрицательное = опустился

          if (positionChange !== 0) {
            changes[itemId] = {
              change: positionChange,
              previousPosition,
              currentPosition,
              title: item.details.name,
            };
          }
        }
      });

      console.log("Вычислены изменения позиций:", changes);
      return changes;
    },
    []
  );

  // Функция для удаления дубликатов контента по ID
  const removeDuplicates = useCallback((existingContent, newContent) => {
    const existingIds = new Set(existingContent.map((item) => item.details.id));
    const uniqueNewContent = newContent.filter(
      (item) => !existingIds.has(item.details.id)
    );

    const duplicatesCount = newContent.length - uniqueNewContent.length;
    if (duplicatesCount > 0) {
      console.log(`Удалено ${duplicatesCount} дубликатов контента`);
    }

    return uniqueNewContent;
  }, []);

  const fetchWatchingContent = useCallback(
    async (pageNum = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        let allContent = [];

        if (reset && pageNum === 1) {
          // При первой загрузке загружаем все страницы сразу
          console.log("Загружаем все страницы контента 'Сейчас смотрят'...");

          let currentPage = 1;
          let hasMorePages = true;

          while (hasMorePages) {
            try {
              const response = await fetch(
                `https://api.vokino.tv/v2/list?sort=watching&page=${currentPage}`
              );
              const data = await response.json();

              console.log(
                `Страница ${currentPage}: ${
                  data.channels?.length || 0
                } элементов`
              );

              if (data.channels && data.channels.length > 0) {
                allContent = [...allContent, ...data.channels];

                // Если на странице меньше 15 элементов, значит это последняя страница
                if (data.channels.length < 15) {
                  hasMorePages = false;
                }
                currentPage++;
              } else {
                hasMorePages = false;
              }

              // Защита от бесконечного цикла - максимум 20 страниц
              if (currentPage > 20) {
                console.log("Достигнут лимит в 20 страниц");
                hasMorePages = false;
              }
            } catch (pageError) {
              console.error(
                `Ошибка загрузки страницы ${currentPage}:`,
                pageError
              );
              hasMorePages = false;
            }
          }

          console.log(
            `Загружено всего ${allContent.length} элементов из ${
              currentPage - 1
            } страниц`
          );

          if (allContent.length > 0) {
            const uniqueContent = removeDuplicates([], allContent);

            // Загружаем предыдущие позиции из localStorage
            const previousPositions = loadPreviousPositions();

            // Вычисляем изменения позиций
            const changes = calculatePositionChanges(
              uniqueContent,
              previousPositions
            );
            setPositionChanges(changes);

            // Сохраняем новые позиции
            savePositionsToStorage(uniqueContent);

            setContent(uniqueContent);
            console.log(
              `После удаления дубликатов: ${uniqueContent.length} элементов`
            );
          } else {
            setContent([]);
          }

          // Устанавливаем, что больше страниц нет, так как загрузили все
          setHasMore(false);
          setPage(currentPage - 1);
        } else {
          // Обычная загрузка одной страницы (не должна использоваться, так как загружаем все сразу)
          const url = `https://api.vokino.tv/v2/list?sort=watching&page=${pageNum}`;
          console.log("Fetching watching content:", { pageNum, url });
          const response = await fetch(url);
          const data = await response.json();

          if (data.channels && data.channels.length > 0) {
            if (reset) {
              setContent(data.channels);
            } else {
              setContent((prev) => {
                const uniqueNewContent = removeDuplicates(prev, data.channels);
                return [...prev, ...uniqueNewContent];
              });
            }
            setHasMore(data.channels.length >= 15);
          } else {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("Error fetching watching content:", error);
      } finally {
        setLoading(false);
        setHasAttemptedFetch(true);
      }
    },
    [
      loading,
      removeDuplicates,
      loadPreviousPositions,
      calculatePositionChanges,
      savePositionsToStorage,
    ]
  );

  useEffect(() => {
    // Ставим loading=true сразу, чтобы не мигал пустой экран
    setLoading(true);
    setHasAttemptedFetch(false);
    setContent([]);
    setPage(1);
    setHasMore(true);
    // Используем setTimeout для обеспечения правильного порядка выполнения
    setTimeout(() => {
      fetchWatchingContent(1, true);
    }, 0);
  }, []); // Загружаем только один раз при монтировании

  // Убираем логику скролла, так как загружаем все контент сразу
  // const handleScroll = useCallback(() => { ... }, []);
  // useEffect(() => { ... }, [handleScroll]);

  const handleAdultContentClick = (item) => {
    setSelectedAdultContent(item);
    setIsAdultDialogOpen(true);
  };

  const handleAdultDialogClose = () => {
    setIsAdultDialogOpen(false);
    setSelectedAdultContent(null);
  };

  const handleAccessGranted = (item) => {
    console.log("Доступ к контенту 18+ разрешен:", item.title);
  };

  // Рассчитывает общий рейтинг на основе доступных рейтингов
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
  const transformContentData = (apiContent) => {
    // Сохраняем все жанры из строки или массива
    let allGenres = apiContent.details.genre;
    if (Array.isArray(allGenres)) {
      // Если уже массив, оставляем как есть
      allGenres = allGenres;
    } else if (typeof allGenres === "string") {
      // Если строка, разбиваем по запятым и очищаем от пробелов
      allGenres = allGenres.split(",").map((genre) => genre.trim());
    }

    // Рассчитываем рейтинг на основе всех доступных источников
    const ratingData = calculateRating(
      apiContent.details.rating_kp,
      apiContent.details.rating_imdb,
      apiContent.details.tmdb_rating
    );

    // Получаем информацию об изменении позиции для этого элемента
    const positionChange = positionChanges[apiContent.details.id];

    return {
      id: apiContent.details.id,
      ident: apiContent.ident, // Добавляем ident для работы с плеерами
      title: apiContent.details.name,
      poster: apiContent.details.poster,
      year: apiContent.details.released,
      genre: allGenres,
      rating: ratingData.rating,
      age: apiContent.details.age,
      showRating: ratingData.showRating,
      type: apiContent.details.is_tv ? "serial" : "movie", // Определяем тип на основе is_tv
      country: apiContent.details.country, // Добавляем страну для фильтрации по странам в избранном
      description: apiContent.details.about, // Добавляем описание для модалки плеера
      // Добавляем информацию об изменении позиции
      positionChange: positionChange
        ? {
            change: positionChange.change,
            previousPosition: positionChange.previousPosition,
            currentPosition: positionChange.currentPosition,
          }
        : null,
    };
  };

  return (
    <div
      className="flex-1 px-6 lg:px-12 py-8"
      style={
        pageStylesEnabled
          ? {
              background: "#222121",
              borderTopLeftRadius: "50px",
              borderTopRightRadius: "50px",
              borderTopWidth: "1px",
              borderTopColor: "#6a6767",
              boxShadow: "inset 0px 13px 20px 4px black",
            }
          : {}
      }
    >
      {/* Заголовок */}
      <div className="mb-6">
        <div
          className="bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-1 gap-1"
          style={{
            background: "linear-gradient(131deg, #191919, #242323)",
            boxShadow: "7px 5px 8px #000000, inset 2px 2px 20px #303132",
          }}
        >
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-background text-foreground ring-2 ring-ring ring-offset-2 hover:bg-background hover:text-foreground">
            Сейчас смотрят
          </button>
        </div>
      </div>

      {/* Контейнер с контентом (виртуализированный по строкам) */}
      {loading && content.length === 0 ? (
        <div
          className="flex flex-wrap gap-4 justify-start content-grid"
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
        <VirtualizedContentGrid
          items={content}
          transformItem={transformContentData}
          onAdultContentClick={handleAdultContentClick}
        />
      )}

      {/* Индикатор загрузки при подгрузке убран, так как загружаем все сразу */}

      <AdultContentDialog
        isOpen={isAdultDialogOpen}
        onClose={handleAdultDialogClose}
        movie={selectedAdultContent}
        onAccessGranted={handleAccessGranted}
      />

      {/* Кнопка "Наверх" */}
      <BackToTopButton />

      {/* Сообщение о количестве загруженного контента */}
      {content.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">Показано {content.length} элементов</p>
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && content.length === 0 && hasAttemptedFetch && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-4">Контент не найден</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Перезагрузить
          </button>
        </div>
      )}
    </div>
  );
};

export default WatchingNowPage;

// Виртуализированный грид по строкам
function VirtualizedContentGrid({ items, transformItem, onAdultContentClick }) {
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
              {rowItems.map((contentItem, idx) => (
                <div
                  key={`${contentItem.details.id}-${startIndex + idx}`}
                  className="w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px]"
                >
                  <MovieCard
                    movie={transformItem(contentItem)}
                    onAdultContentClick={onAdultContentClick}
                    showAllGenres={false}
                    showContentTypeBadge={true}
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

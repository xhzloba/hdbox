"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown } from "lucide-react";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import AdultContentDialog from "../components/AdultContentDialog";
import { useKids } from "../contexts/KidsContext";
import SettingsContext from "../contexts/SettingsContext";

const SeriesPage = () => {
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
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAdultSeries, setSelectedAdultSeries] = useState(null);
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [compilationCounts, setCompilationCounts] = useState({});

  const tabs = [
    {
      id: "updatings",
      title: "Обновления",
      url: "https://api.vokino.tv/v2/list?sort=updatings&type=serial",
    },
    {
      id: "new",
      title: "Новинки",
      url: "https://api.vokino.tv/v2/list?sort=new&type=serial",
    },
    {
      id: "popular",
      title: "Популярное",
      url: "https://api.vokino.tv/v2/list?sort=popular&type=serial",
    },
    {
      id: "rating",
      title: "Лучшее",
      url: "https://api.vokino.tv/v2/list?sort=rating&type=serial",
    },
    {
      id: "divider",
      title: "",
      isDivider: true,
    },
    {
      id: "hbo-max",
      title: "HBO Max",
      url: "https://api.vokino.tv/v2/compilations/content/65a982c3c9e4458dd2558651",
      isCompilation: true,
    },
    {
      id: "kion",
      title: "KION",
      url: "https://api.vokino.tv/v2/compilations/content/65a9567148ed1afd744a552f",
      isCompilation: true,
    },
    {
      id: "fox",
      title: "FOX",
      url: "https://api.vokino.tv/v2/compilations/content/65aaaf32ce9f3661fe41dcfa",
      isCompilation: true,
    },
  ];
  // Функция для удаления дубликатов сериалов по ID

  // Предварительная загрузка счетчиков подборок при инициализации
  useEffect(() => {
    const loadCompilationCounts = async () => {
      const compilationTabs = tabs.filter(tab => tab.isCompilation);
      
      const countPromises = compilationTabs.map(async (tab) => {
        try {
          const response = await fetch(tab.url);
          const data = await response.json();
          return { id: tab.id, count: data.channels ? data.channels.length : 0 };
        } catch (error) {
          console.error(`Error loading count for ${tab.title}:`, error);
          return { id: tab.id, count: 0 };
        }
      });
      
      const results = await Promise.all(countPromises);
      const counts = {};
      results.forEach(result => {
        counts[result.id] = result.count;
      });
      
      setCompilationCounts(counts);
    };
    
    loadCompilationCounts();
  }, []); // Выполняется только при монтировании компонента


  const allTabs = tabs;
  const removeDuplicates = useCallback((existingSeries, newSeries) => {
    const existingIds = new Set(
      existingSeries.map((series) => series.details.id)
    );
    const uniqueNewSeries = newSeries.filter(
      (series) => !existingIds.has(series.details.id)
    );

    const duplicatesCount = newSeries.length - uniqueNewSeries.length;
    if (duplicatesCount > 0) {
      console.log(`Удалено ${duplicatesCount} дубликатов сериалов`);
    }

    return uniqueNewSeries;
  }, []);

  const fetchSeries = useCallback(
    async (tabId, pageNum = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const tab = tabs.find((t) => t.id === tabId);
        let allSeries = [];

        if (tab.isCompilation) {
          // Для подборок загружаем данные напрямую без пагинации
          const response = await fetch(tab.url);
    
          const data = await response.json();
        
          if (data.channels && data.channels.length > 0) {
    
            setSeries(data.channels);
            setCompilationCounts(prev => ({ ...prev, [tab.id]: data.channels.length }));
            setHasMore(false); // Подборки не имеют пагинации
          } else {
            setSeries([]);
            setHasMore(false);
          }
        } else {
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
              allSeries = [...allSeries, ...page1Data.channels];
            }

            if (page2Data.channels && page2Data.channels.length > 0) {
              allSeries = [...allSeries, ...page2Data.channels];
            }

            setPage(2); // Устанавливаем страницу на 2, так как уже загрузили первые две

            // Проверяем, есть ли еще данные
            if (!page2Data.channels || page2Data.channels.length < 15) {
              setHasMore(false);
            }

            if (allSeries.length > 0) {
              const uniqueSeries = removeDuplicates([], allSeries);
              setSeries(uniqueSeries);
            } else {
              setSeries([]);
              setHasMore(false);
            }
          } else {
            // Обычная загрузка одной страницы
            const url = `${tab.url}&page=${pageNum}`;
            console.log("Fetching series:", { tabId, pageNum, url });
            const response = await fetch(url);
            const data = await response.json();
            console.log("API Response:", {
              channels: data.channels?.length,
              hasMore: data.channels?.length >= 15,
            });

            if (data.channels && data.channels.length > 0) {
              if (reset) {
                setSeries(data.channels);
              } else {
                setSeries((prev) => {
                  const uniqueNewSeries = removeDuplicates(prev, data.channels);
                  console.log(
                    `Добавлено ${uniqueNewSeries.length} уникальных сериалов из ${data.channels.length}`
                  );
                  return [...prev, ...uniqueNewSeries];
                });
              }
              setHasMore(data.channels.length >= 15);
            } else {
              setHasMore(false);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching series:", error);
      } finally {
        setLoading(false);
        setHasAttemptedFetch(true);
      }
    },
    [loading, removeDuplicates]
  );

  useEffect(() => {
    setLoading(true);
    setHasAttemptedFetch(false);
    setSeries([]);
    setPage(1);
    setHasMore(true);
    // Используем setTimeout для обеспечения правильного порядка выполнения
    setTimeout(() => {
      fetchSeries(activeTab, 1, true);
    }, 0);
  }, [activeTab]); // Убираем fetchSeries из зависимостей

  const handleScroll = useCallback(() => {
    // Проверяем, является ли текущий таб подборкой
    const currentTab = tabs.find((t) => t.id === activeTab);
    if (currentTab?.isCompilation) {
      return; // Подборки не поддерживают пагинацию
    }

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
      seriesCount: series.length,
    });

    if (document?.documentElement?.dataset?.searchActive === "true") {
      return;
    }

    if (!isNearBottom || loading || !hasMore) {
      return;
    }

    const nextPage = page + 1;
    console.log("Loading next page:", nextPage);
    setPage(nextPage);
    fetchSeries(activeTab, nextPage, false);
  }, [activeTab, hasMore, loading, page, series.length, allTabs]);

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
    if (tabId !== activeTab && tabId !== "divider") {
      setActiveTab(tabId);
    }
  };

  const handleAdultContentClick = (series) => {
    setSelectedAdultSeries(series);
    setIsAdultDialogOpen(true);
  };

  const handleAdultDialogClose = () => {
    setIsAdultDialogOpen(false);
    setSelectedAdultSeries(null);
  };

  const handleAccessGranted = (series) => {
    console.log("Доступ к контенту 18+ разрешен:", series.title);
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
  const transformSeriesData = (apiSeries) => {
    // Сохраняем все жанры из строки или массива
    let allGenres = apiSeries.details.genre;
    if (Array.isArray(allGenres)) {
      // Если уже массив, оставляем как есть
      allGenres = allGenres;
    } else if (typeof allGenres === "string") {
      // Если строка, разбиваем по запятым и очищаем от пробелов
      allGenres = allGenres.split(",").map((genre) => genre.trim());
    }

    // Рассчитываем рейтинг на основе всех доступных источников (как в слайдерах)
    const ratingData = calculateRating(
      apiSeries.details.rating_kp,
      apiSeries.details.rating_imdb,
      apiSeries.details.tmdb_rating
    );

    return {
      id: apiSeries.details.id,
      ident: apiSeries.ident, // Добавляем ident для работы с плеерами
      title: apiSeries.details.name,
      poster: apiSeries.details.poster,
      year: apiSeries.details.released,
      genre: allGenres,
      rating: ratingData.rating,
      age: apiSeries.details.age,
      showRating: ratingData.showRating,
      type: "serial", // Добавляем тип для правильной фильтрации в избранном
      country: apiSeries.details.country, // Добавляем страну для фильтрации по странам в избранном
      description: apiSeries.details.about, // Добавляем описание для модалки плеера
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
          {tabs.map((tab, index) => {
            if (tab.isDivider) {
              return (
                <div
                  key={tab.id}
                  className="w-px h-6 bg-gray-400 mx-2"
                />
              );
            }
            
            return (
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
                {tab.isCompilation && compilationCounts[tab.id] && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center bg-primary/20 text-primary">
                    {compilationCounts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Контейнер с сериалами (виртуализированный по строкам) */}
      {loading && series.length === 0 ? (
        <div
          className="flex flex-wrap gap-4 justify-start series-grid"
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
        <VirtualizedSeriesGrid
          items={series}
          transformItem={transformSeriesData}
          onAdultContentClick={handleAdultContentClick}
        />
      )}

      {/* Индикатор загрузки при подгрузке */}
      {loading && series.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Загрузка...</span>
        </div>
      )}

      <AdultContentDialog
        isOpen={isAdultDialogOpen}
        onClose={handleAdultDialogClose}
        movie={selectedAdultSeries}
        onAccessGranted={handleAccessGranted}
      />

      {/* Сообщение об окончании контента */}
      {!hasMore && series.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">Больше сериалов нет</p>
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && series.length === 0 && hasAttemptedFetch && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Сериалы не найдены</p>
        </div>
      )}
    </div>
  );
};

export default SeriesPage;

function VirtualizedSeriesGrid({ items, transformItem, onAdultContentClick }) {
  const containerRef = React.useRef(null);
  const [containerWidth, setContainerWidth] = React.useState(1024);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const measure = () => {
      if (document?.documentElement?.dataset?.sidebarAnimating === "true") {
        return;
      }
      const w = containerRef.current?.getBoundingClientRect().width || 1024;
      setContainerWidth(w);
    };
    measure();
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

  const cardWidth = containerWidth >= 768 ? 200 : 120;
  const gap = 16;
  const cardsPerRow = Math.max(
    1,
    Math.floor((containerWidth + gap) / (cardWidth + gap))
  );
  const estimateRowHeight =
    containerWidth >= 768 ? (showDetails ? 406 : 320) : 200;
  const rowCount = Math.ceil(items.length / cardsPerRow);

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => estimateRowHeight,
    overscan: 6,
  });

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
              {rowItems.map((seriesItem, idx) => (
                <div
                  key={`${seriesItem.details.id}-${startIndex + idx}`}
                  className="w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px]"
                >
                  <MovieCard
                    movie={transformItem(seriesItem)}
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

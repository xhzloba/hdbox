"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import AdultContentDialog from "../components/AdultContentDialog";
import BackToTopButton from "../components/BackToTopButton";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { TextShimmer } from "../../components/ui/text-shimmer";

import SettingsContext from "../contexts/SettingsContext";

// Основные табы
const MAIN_TABS = [
  {
    id: "updatings",
    title: "Обновления",
    url: "https://api.vokino.pro/v2/list?sort=updatings&type=serial",
  },
  {
    id: "new",
    title: "Новинки",
    url: "https://api.vokino.pro/v2/list?sort=new&type=serial",
  },
  {
    id: "popular",
    title: "Популярное",
    url: "https://api.vokino.pro/v2/list?sort=popular&type=serial",
  },
  {
    id: "rating",
    title: "Лучшее",
    url: "https://api.vokino.pro/v2/list?sort=rating&type=serial",
  },
];

// Подборки
const COMPILATION_TABS = [
  {
    id: "hbo-max",
    title: "HBO Max",
    url: "https://api.vokino.pro/v2/compilations/content/65a982c3c9e4458dd2558651",
    isCompilation: true,
  },
  {
    id: "kion",
    title: "KION",
    url: "https://api.vokino.pro/v2/compilations/content/65a9567148ed1afd744a552f",
    isCompilation: true,
  },
  {
    id: "fx",
    title: "FX",
    url: "https://api.vokino.pro/v2/compilations/content/65aa9cd65c350868501d64de",
    isCompilation: true,
  },
  {
    id: "fox",
    title: "FOX",
    url: "https://api.vokino.pro/v2/compilations/content/65aaaf32ce9f3661fe41dcfa",
    isCompilation: true,
  },
  {
    id: "netflix",
    title: "Netflix",
    url: "https://api.vokino.pro/v2/compilations/content/65a6b9dabce57d552a34b40d",
    isCompilation: true,
  },
  {
    id: "start",
    title: "START",
    url: "https://api.vokino.pro/v2/compilations/content/65a95233cc1b09d659daf258",
    isCompilation: true,
  },
  {
    id: "the-cw",
    title: "The CW",
    url: "https://api.vokino.pro/v2/compilations/content/65aadc5433b3f4c779c49a94",
    isCompilation: true,
  },
  {
    id: "apple",
    title: "Apple",
    url: "https://api.vokino.pro/v2/compilations/content/65a943811228b82ed988d3dc",
    isCompilation: true,
  },
  {
    id: "amc",
    title: "AMC",
    url: "https://api.vokino.pro/v2/compilations/content/65a95edd2b34412c2ad95bee",
    isCompilation: true,
  },
  {
    id: "premier",
    title: "PREMIER",
    url: "https://api.vokino.pro/v2/compilations/content/65abad2c1d125fc30bb3df8d",
    isCompilation: true,
  },
  {
    id: "paramount",
    title: "Paramount+",
    url: "https://api.vokino.pro/v2/compilations/content/65a94cfd72dc1bebf189878b",
    isCompilation: true,
  },
  {
    id: "hulu",
    title: "Hulu",
    url: "https://api.vokino.pro/v2/compilations/content/65b7e6b0d43413036b2c342f",
    isCompilation: true,
  },
];

// Все табы для совместимости
const SERIES_TABS = [...MAIN_TABS, ...COMPILATION_TABS];

const SeriesPage = () => {
  const [activeTab, setActiveTab] = useState("updatings");
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAdultSeries, setSelectedAdultSeries] = useState(null);
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedCompilation, setSelectedCompilation] = useState(null);
  
  // Получаем настройки из контекста
  const settingsContext = useContext(SettingsContext);
  const pageStylesEnabled = settingsContext?.pageStylesEnabled ?? false;

  // Функция для удаления дубликатов сериалов по ID


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
        const tab = SERIES_TABS.find((t) => t.id === tabId);
        let allSeries = [];

        if (tab.isCompilation) {
          // Для подборок загружаем данные напрямую без пагинации
          const response = await fetch(tab.url);
    
          const data = await response.json();
        
          if (data.channels && data.channels.length > 0) {
    
            setSeries(data.channels);
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
    // Ставим loading=true сразу, чтобы не мигал пустой экран
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
    const currentTab = SERIES_TABS.find((t) => t.id === activeTab);
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
  }, [activeTab, hasMore, loading, page, series.length]);

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
    if (activeTab === tabId) return;
    
    // Сбрасываем выбранную подборку при клике на основные табы
    if (MAIN_TABS.some(tab => tab.id === tabId)) {
      setSelectedCompilation(null);
    }
    
    setActiveTab(tabId);
    setSeries([]);
    setPage(1);
    setHasMore(true);
    setHasAttemptedFetch(false);
    
    // Сбрасываем состояние загрузки
    setLoading(false);
    
    // Принудительно запускаем загрузку для нового таба
    setTimeout(() => {
      fetchSeries(tabId, 1, true);
    }, 0);
  };

  const handleCompilationSelect = (tabId) => {
    const selectedTab = COMPILATION_TABS.find(tab => tab.id === tabId);
    setSelectedCompilation(selectedTab);
    setActiveTab(tabId);
    setIsPopoverOpen(false);
    
    // Сбрасываем данные и загружаем новые
    setSeries([]);
    setPage(1);
    setHasMore(true);
    setHasAttemptedFetch(false);
    setLoading(false);
    
    setTimeout(() => {
      fetchSeries(tabId, 1, true);
    }, 0);
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
      tags: apiSeries.details.tags || [], // Добавляем теги для отображения качества
    };
  };

  return (
    <div 
      className="flex-1 px-6 lg:px-12 py-8"
      style={pageStylesEnabled ? {
        background: '#222121',
        borderTopLeftRadius: '50px',
        borderTopRightRadius: '50px',
        borderTopWidth: '1px',
        borderTopColor: '#6a6767',
      } : {}}
    >
      {/* Табы */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          {/* Основные табы */}
          <div
            className="bg-muted text-[#71717a] inline-flex w-fit items-center justify-center rounded-lg p-1 gap-1"
            style={{
              background: 'linear-gradient(131deg, #191919, #242323)',
              boxShadow: '7px 5px 8px #000000, inset 2px 2px 20px #303132'
            }}
          >
            {MAIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  activeTab === tab.id
                    ? "bg-background ring-2 ring-ring ring-offset-2"
                    : ""
                }`}
              >
                {activeTab === tab.id ? (
                  <TextShimmer 
                    key={`shimmer-${tab.id}`} 
                    duration={2} 
                    spread={1}
                    isVisible={!loading}
                    delay={500}
                  >
                    {tab.title}
                  </TextShimmer>
                ) : (
                  tab.title
                )}
              </button>
            ))}
          </div>

          {/* Кнопка для подборок с анимацией */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <button
                className={`${selectedCompilation ? 'px-4' : 'w-10'} h-10 rounded-full inline-flex items-center justify-center gap-2 text-sm font-medium ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-105 active:scale-95 ${
                  COMPILATION_TABS.some(tab => tab.id === activeTab)
                    ? "bg-background ring-2 ring-ring ring-offset-2"
                    : "text-[#71717a]"
                }`}
                style={{
                  background: COMPILATION_TABS.some(tab => tab.id === activeTab) 
                    ? undefined 
                    : 'linear-gradient(131deg, #191919, #242323)',
                  boxShadow: COMPILATION_TABS.some(tab => tab.id === activeTab)
                    ? undefined
                    : isPopoverOpen 
                      ? 'inset 7px 5px 8px #000000, 2px 2px 20px #303132'
                      : '7px 5px 8px #000000, inset 2px 2px 20px #303132',
                  transition: 'all 0.3s ease-in-out, width 0.3s ease-in-out'
                }}
              >
                {selectedCompilation && (
                  <span className="whitespace-nowrap animate-in fade-in-0 slide-in-from-left-2 duration-300">
                    {selectedCompilation.title}
                  </span>
                )}
                <ChevronDown 
                  className="w-4 h-4 transition-transform duration-300 ease-in-out flex-shrink-0" 
                  style={{
                    transform: isPopoverOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                  }}
                />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="start">
              <div className="space-y-1">
                <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                  Подборки сериалов
                </div>
                {COMPILATION_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => handleCompilationSelect(tab.id)}
                    className={`w-full flex items-center justify-between px-2 py-2 text-sm rounded-md transition-colors ${
                      activeTab === tab.id
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <span>{tab.title}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
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
          <p className="text-gray-400 text-lg mb-4">Сериалы не найдены</p>
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
                    showAllGenres={true}
                    isInFavoritesPage={false}
                  />
                </div>
              ))}
            </div>
          );
        })}
      </div>
      
      {/* Кнопка "Наверх" */}
      <BackToTopButton />
    </div>
  );
};

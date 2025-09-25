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

const MAIN_TABS = [
  {
    id: "updatings",
    title: "Обновления",
    url: "https://api.vokino.pro/v2/list?sort=updatings&type=multfilm",
  },
  {
    id: "new",
    title: "Новинки",
    url: "https://api.vokino.pro/v2/list?sort=new&type=multfilm",
  },
  {
    id: "popular",
    title: "Популярное",
    url: "https://api.vokino.pro/v2/list?sort=popular&type=multfilm",
  },
  {
    id: "rating",
    title: "Лучшее",
    url: "https://api.vokino.pro/v2/list?sort=rating&type=multfilm",
  },
];

const COMPILATION_TABS = [
  // Пока оставляем пустым, можно добавить подборки мультфильмов позже
];

const ALL_TABS = [...MAIN_TABS, ...COMPILATION_TABS];

const CartoonsPage = () => {
  const settings = useContext(SettingsContext);
  const pageStylesEnabled = settings?.pageStylesEnabled ?? false;
  
  const [activeTab, setActiveTab] = useState("updatings");
  const [cartoons, setCartoons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAdultCartoon, setSelectedAdultCartoon] = useState(null);
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedCompilation, setSelectedCompilation] = useState(null);

  const isCompilationActive = COMPILATION_TABS.find(tab => tab.id === activeTab)?.isCompilation || false;

  const tabs = MAIN_TABS;

  // Функция для удаления дубликатов мультфильмов по ID
  const removeDuplicates = useCallback((existingCartoons, newCartoons) => {
    const existingIds = new Set(
      existingCartoons.map((cartoon) => cartoon.details.id)
    );
    const uniqueNewCartoons = newCartoons.filter(
      (cartoon) => !existingIds.has(cartoon.details.id)
    );

    const duplicatesCount = newCartoons.length - uniqueNewCartoons.length;
    if (duplicatesCount > 0) {
      console.log(`Удалено ${duplicatesCount} дубликатов мультфильмов`);
    }

    return uniqueNewCartoons;
  }, []);



  const fetchCartoons = useCallback(
    async (tabId, pageNum = 1, reset = false) => {
      
      if (loading) return;

      setLoading(true);
      try {
        const tab = ALL_TABS.find((t) => t.id === tabId);
        
        let allCartoons = [];

        if (tab.isCompilation) {
          // Для подборок загружаем данные напрямую без пагинации
          const response = await fetch(tab.url);
          const data = await response.json();
        
          if (data.channels && data.channels.length > 0) {
            setCartoons(data.channels);
            setHasMore(false); // Подборки не имеют пагинации
          } else {
            setCartoons([]);
            setHasMore(false);
          }
        } else {
          const shouldLoadTwoPages = reset && pageNum === 1;
          
          if (shouldLoadTwoPages) {
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
              allCartoons = [...allCartoons, ...page1Data.channels];
            }

            if (page2Data.channels && page2Data.channels.length > 0) {
              allCartoons = [...allCartoons, ...page2Data.channels];
            }

            setPage(2); // Устанавливаем страницу на 2, так как уже загрузили первые две

            // Проверяем, есть ли еще данные
            if (!page2Data.channels || page2Data.channels.length < 15) {
              setHasMore(false);
            }

            if (allCartoons.length > 0) {
              const uniqueCartoons = removeDuplicates([], allCartoons);
              setCartoons(uniqueCartoons);
            } else {
              setCartoons([]);
              setHasMore(false);
            }
          } else {
            // Обычная загрузка одной страницы
            const url = `${tab.url}&page=${pageNum}`;
            const response = await fetch(url);
            const data = await response.json();
       
            if (data.channels && data.channels.length > 0) {
              if (reset) {
                setCartoons(data.channels);
              } else {
                setCartoons((prev) => {
                  const uniqueNewCartoons = removeDuplicates(prev, data.channels);
                  console.log(
                    `Добавлено ${uniqueNewCartoons.length} уникальных мультфильмов из ${data.channels.length}`
                  );
                  return [...prev, ...uniqueNewCartoons];
                });
              }
              setHasMore(data.channels.length >= 15);
            } else {
              setHasMore(false);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching cartoons:", error);
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
    setCartoons([]);
    setPage(1);
    setHasMore(true);
    // Используем setTimeout для обеспечения правильного порядка выполнения
    setTimeout(() => {
      fetchCartoons(activeTab, 1, true);
    }, 0);
  }, [activeTab]); // Убираем fetchCartoons из зависимостей

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
      cartoonsCount: cartoons.length,
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
    fetchCartoons(activeTab, nextPage, false);
  }, [activeTab, hasMore, loading, page, cartoons.length, fetchCartoons]);

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
    setCartoons([]);
    setPage(1);
    setHasMore(true);
    setHasAttemptedFetch(false);
    
    // Сбрасываем состояние загрузки
    setLoading(false);
    
    // Принудительно запускаем загрузку для нового таба
    setTimeout(() => {
      fetchCartoons(tabId, 1, true);
    }, 0);
  };

  const handleCompilationSelect = (tabId) => {
    const selectedTab = COMPILATION_TABS.find(tab => tab.id === tabId);
    setSelectedCompilation(selectedTab);
    setActiveTab(tabId);
    setIsPopoverOpen(false);
    
    // Сбрасываем данные и загружаем новые
    setCartoons([]);
    setPage(1);
    setHasMore(true);
    setHasAttemptedFetch(false);
    setLoading(false);
    
    setTimeout(() => {
      fetchCartoons(tabId, 1, true);
    }, 0);
  };

  const handleAdultContentClick = (cartoon) => {
    setSelectedAdultCartoon(cartoon);
    setIsAdultDialogOpen(true);
  };

  const handleAdultDialogClose = () => {
    setIsAdultDialogOpen(false);
    setSelectedAdultCartoon(null);
  };

  const handleAccessGranted = (cartoon) => {
    console.log("Доступ к контенту 18+ разрешен:", cartoon.title);
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
  const transformCartoonData = (apiCartoon) => {
    // Сохраняем все жанры из строки или массива
    let allGenres = apiCartoon.details.genre;
    if (Array.isArray(allGenres)) {
      // Если уже массив, оставляем как есть
      allGenres = allGenres;
    } else if (typeof allGenres === "string") {
      // Если строка, разбиваем по запятым и очищаем от пробелов
      allGenres = allGenres.split(",").map((genre) => genre.trim());
    }

    // Рассчитываем рейтинг на основе всех доступных источников (как в слайдерах)
    const ratingData = calculateRating(
      apiCartoon.details.rating_kp,
      apiCartoon.details.rating_imdb,
      apiCartoon.details.tmdb_rating
    );

    return {
      id: apiCartoon.details.id,
      ident: apiCartoon.ident, // Добавляем ident для работы с плеерами
      title: apiCartoon.details.name,
      poster: apiCartoon.details.poster,
      year: apiCartoon.details.released,
      genre: allGenres,
      rating: ratingData.rating,
      age: apiCartoon.details.age,
      showRating: ratingData.showRating,
      type: "multfilm", // Добавляем тип для правильной фильтрации в избранном
      country: apiCartoon.details.country, // Добавляем страну для фильтрации по странам в избранном
      description: apiCartoon.details.about, // Добавляем описание для модалки плеера
      tags: apiCartoon.details.tags || [], // Добавляем теги для отображения качества
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
      <div className="mb-6 flex items-center gap-3">
        <div
          className={`bg-muted text-[#71717a] inline-flex w-fit items-center justify-center rounded-lg p-1 ${"gap-1"}`}
          style={{
            background: 'linear-gradient(131deg, #191919, #242323)',
            boxShadow: '7px 5px 8px #000000, inset 2px 2px 20px #303132'
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeTab === tab.id
                  ? "bg-background ring-2 ring-[rgb(255,0,200)] ring-offset-2"
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
                  shimmerColor="rgba(255,105,180,0.9)"
                >
                  {tab.title}
                </TextShimmer>
              ) : (
                tab.title
              )}
            </button>
          ))}
        </div>
        {COMPILATION_TABS.length > 0 && (
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
                  Подборки мультфильмов
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
        )}
      </div>

      {/* Контейнер с мультфильмами (виртуализированный по строкам) */}
      {loading && cartoons.length === 0 ? (
        <div
          className="flex flex-wrap gap-4 justify-start cartoon-grid"
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
        <VirtualizedCartoonsGrid
          items={cartoons}
          transformItem={transformCartoonData}
          onAdultContentClick={handleAdultContentClick}
        />
      )}

      {/* Индикатор загрузки при подгрузке */}
      {loading && cartoons.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Загрузка...</span>
        </div>
      )}

      <AdultContentDialog
        isOpen={isAdultDialogOpen}
        onClose={handleAdultDialogClose}
        movie={selectedAdultCartoon}
        onAccessGranted={handleAccessGranted}
      />

      {/* Кнопка "Наверх" */}
      <BackToTopButton />

      {/* Сообщение об окончании контента */}
      {!hasMore && cartoons.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">Больше мультфильмов нет</p>
        </div>
      )}

      {/* Пустое состояние */}
      {!loading && cartoons.length === 0 && hasAttemptedFetch && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-4">Мультфильмы не найдены</p>
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

export default CartoonsPage;

// Виртуализированный грид по строкам (простая реализация, без ломки верстки)
function VirtualizedCartoonsGrid({ items, transformItem, onAdultContentClick }) {
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
              {rowItems.map((cartoon, idx) => (
                <div
                  key={`${cartoon.details.id}-${startIndex + idx}`}
                  className="w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px]"
                >
                  <MovieCard
                    movie={transformItem(cartoon)}
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
    </div>
  );
}
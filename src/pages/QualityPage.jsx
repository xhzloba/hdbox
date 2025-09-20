"use client";

import React, { useState, useEffect, useCallback, useContext } from "react";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import MovieCard from "../components/MovieCard";
import MovieCardSkeleton from "../components/MovieCardSkeleton";
import AdultContentDialog from "../components/AdultContentDialog";
import BackToTopButton from "../components/BackToTopButton";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";

import SettingsContext from "../contexts/SettingsContext";

const QUALITY_TABS = [
  {
    id: "4k-hdr",
    title: "4K HDR",
    url: "https://api.vokino.tv/v2/list?sort=new&tag=4K%20HDR",
  },
  {
    id: "4k",
    title: "4K",
    url: "https://api.vokino.tv/v2/list?sort=new&tag=4K",
  },
  {
    id: "4k-dolby",
    title: "4K DolbyVision",
    url: "https://api.vokino.tv/v2/list?sort=new&tag=4K%20DolbyV",
  },
  {
    id: "60fps",
    title: "60 FPS",
    url: "https://api.vokino.tv/v2/list?sort=new&tag=60FPS",
  },
];

const QualityPage = () => {
  const settings = useContext(SettingsContext);
  const pageStylesEnabled = settings?.pageStylesEnabled ?? false;
  
  const [activeTab, setActiveTab] = useState("4k-hdr");
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedAdultContent, setSelectedAdultContent] = useState(null);
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  const tabs = QUALITY_TABS;

  // Функция для удаления дубликатов контента по ID
  const removeDuplicates = useCallback((existingContent, newContent) => {
    const existingIds = new Set(
      existingContent.map((item) => item.details.id)
    );
    const uniqueNewContent = newContent.filter(
      (item) => !existingIds.has(item.details.id)
    );

    const duplicatesCount = newContent.length - uniqueNewContent.length;
    if (duplicatesCount > 0) {
      console.log(`Удалено ${duplicatesCount} дубликатов контента`);
    }

    return uniqueNewContent;
  }, []);

  const fetchContent = useCallback(
    async (tabId, pageNum = 1, reset = false) => {
      if (loading) return;

      setLoading(true);
      try {
        const tab = QUALITY_TABS.find((t) => t.id === tabId);
        let allContent = [];

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
            allContent = [...allContent, ...page1Data.channels];
          }

          if (page2Data.channels && page2Data.channels.length > 0) {
            allContent = [...allContent, ...page2Data.channels];
          }

          setPage(2); // Устанавливаем страницу на 2, так как уже загрузили первые две

          // Проверяем, есть ли еще данные
          if (!page2Data.channels || page2Data.channels.length < 15) {
            setHasMore(false);
          }

          if (allContent.length > 0) {
            const uniqueContent = removeDuplicates([], allContent);
            setContent(uniqueContent);
          } else {
            setContent([]);
            setHasMore(false);
          }
        } else {
          // Обычная загрузка одной страницы
          const url = `${tab.url}&page=${pageNum}`;
          console.log("Fetching quality content:", { tabId, pageNum, url });
          const response = await fetch(url);
          const data = await response.json();
          console.log("API Response:", {
            channels: data.channels?.length,
            hasMore: data.channels?.length >= 15,
          });

          if (data.channels && data.channels.length > 0) {
            if (reset) {
              setContent(data.channels);
            } else {
              setContent((prev) => {
                const uniqueNewContent = removeDuplicates(prev, data.channels);
                console.log(
                  `Добавлено ${uniqueNewContent.length} уникального контента из ${data.channels.length}`
                );
                return [...prev, ...uniqueNewContent];
              });
            }
            setHasMore(data.channels.length >= 15);
          } else {
            setHasMore(false);
          }
        }
      } catch (error) {
        console.error("Error fetching quality content:", error);
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
    setContent([]);
    setPage(1);
    setHasMore(true);
    // Используем setTimeout для обеспечения правильного порядка выполнения
    setTimeout(() => {
      fetchContent(activeTab, 1, true);
    }, 0);
  }, [activeTab]); // Убираем fetchContent из зависимостей

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
      contentCount: content.length,
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
    fetchContent(activeTab, nextPage, false);
  }, [activeTab, hasMore, loading, page, content.length, fetchContent]);

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
    
    setActiveTab(tabId);
    setContent([]);
    setPage(1);
    setHasMore(true);
    setHasAttemptedFetch(false);
    
    // Сбрасываем состояние загрузки
    setLoading(false);
    
    // Принудительно запускаем загрузку для нового таба
    setTimeout(() => {
      fetchContent(tabId, 1, true);
    }, 0);
  };

  const handleAdultContentClick = (contentItem) => {
    setSelectedAdultContent(contentItem);
    setIsAdultDialogOpen(true);
  };

  const handleAdultDialogClose = () => {
    setIsAdultDialogOpen(false);
    setSelectedAdultContent(null);
  };

  const handleAccessGranted = (contentItem) => {
    console.log("Доступ к контенту 18+ разрешен:", contentItem.title);
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
      type: apiContent.details.type || "movie", // Добавляем тип для правильной фильтрации
      country: apiContent.details.country, // Добавляем страну для фильтрации
      description: apiContent.details.about, // Добавляем описание для модалки плеера
      tags: apiContent.details.tags || [], // Добавляем теги для отображения качества
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
          className={`bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-1 ${"gap-1"}`}
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
                  ? "bg-background text-foreground ring-2 ring-ring ring-offset-2"
                  : "hover:bg-background/50 hover:text-foreground"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* Контейнер с контентом (виртуализированный по строкам) */}
      {loading && content.length === 0 ? (
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
        <VirtualizedContentGrid
          items={content}
          transformItem={transformContentData}
          onAdultContentClick={handleAdultContentClick}
        />
      )}

      {/* Индикатор загрузки при подгрузке */}
      {loading && content.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-gray-400">Загрузка...</span>
        </div>
      )}

      <AdultContentDialog
        isOpen={isAdultDialogOpen}
        onClose={handleAdultDialogClose}
        movie={selectedAdultContent}
        onAccessGranted={handleAccessGranted}
      />

      {/* Кнопка "Наверх" */}
      <BackToTopButton />

      {/* Сообщение об окончании контента */}
      {!hasMore && content.length > 0 && (
        <div className="text-center py-8">
          <p className="text-gray-400">Больше контента нет</p>
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

export default QualityPage;

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
          const endIndex = Math.min(startIndex + cardsPerRow, items.length);
          const rowItems = items.slice(startIndex, endIndex);

          return (
            <div
              key={row.key}
              data-index={row.index}
              ref={virtualizer.measureElement}
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
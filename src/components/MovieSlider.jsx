"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight, Eye, Star, Film, Tv } from "lucide-react"
import MovieCardWithSkeleton from "./MovieCardWithSkeleton"
import MovieCardSkeleton from "./MovieCardSkeleton"
import AdultContentDialog from "./AdultContentDialog"
import { TextShimmer } from "../../components/ui/text-shimmer"


const MovieSlider = ({ movies, title = "Популярное сейчас", tabs, activeTab, onTabChange, isLoading, tabsConfig, sectionTitle, newIndicators, sidebarOpen, newMovies = [], showContentTypeBadge = false }) => {
  const [selectedAdultMovie, setSelectedAdultMovie] = useState(null)
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false)
  
  // Определяем нужно ли показывать бейджики типа контента
  const shouldShowContentTypeBadge = () => {
    // Если используется tabsConfig (второй слайдер с "Новинки" и "Обновления"), показываем всегда
    if (tabsConfig) {
      return showContentTypeBadge
    }
    // Для первого слайдера показываем только для табов "watching" и "popular"
    return showContentTypeBadge && (activeTab === 'watching' || activeTab === 'popular')
  }
  // Кастомные табы без использования shadcn Tabs компонента
  const customTabs = tabs ? (
    <div className="bg-muted text-[#71717a] inline-flex w-fit items-center justify-center rounded-lg p-1 gap-1" style={{ userSelect: 'none', background: 'linear-gradient(131deg, #191919, #242323)', boxShadow: '7px 5px 8px #000000, inset 2px 2px 20px #303132' }}>
      {tabsConfig ? (
        // Используем кастомную конфигурацию табов
        tabsConfig.map((tab) => (
          <button
            key={tab.value}
            onClick={() => onTabChange(tab.value)}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === tab.value
                ? "bg-background ring-2 ring-ring ring-offset-2"
                : ""
            }`}
            style={{ userSelect: 'none' }}
          >
            <span className="flex items-center gap-2" style={{ userSelect: 'none' }}>
              {activeTab === tab.value ? (
                <TextShimmer 
                  key={`shimmer-${tab.value}`} 
                  duration={2} 
                  spread={1}
                  isVisible={!isLoading}
                  delay={500}
                >
                  {tab.label}
                </TextShimmer>
              ) : (
                tab.label
              )}
              {newIndicators && newIndicators[tab.value] && (
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              )}
            </span>
          </button>
        ))
      ) : (
        // Дефолтные табы для популярного контента
        <>
          <button
            onClick={() => onTabChange("watching")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === "watching"
                ? "bg-background ring-2 ring-ring ring-offset-2"
                : ""
            }`}
            style={{ userSelect: 'none' }}
          >
            <span style={{ userSelect: 'none' }}>
              {activeTab === "watching" ? (
                <TextShimmer 
                  key="shimmer-watching" 
                  duration={2} 
                  spread={1}
                  isVisible={!isLoading}
                  delay={500}
                >
                  Сейчас смотрят
                </TextShimmer>
              ) : (
                "Сейчас смотрят"
              )}
            </span>
          </button>
          <button
            onClick={() => onTabChange("popular")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === "popular"
                ? "bg-background ring-2 ring-ring ring-offset-2"
                : ""
            }`}
            style={{ userSelect: 'none' }}
          >
            <span style={{ userSelect: 'none' }}>
              {activeTab === "popular" ? (
                <TextShimmer 
                  key="shimmer-popular" 
                  duration={2} 
                  spread={1}
                  isVisible={!isLoading}
                  delay={500}
                >
                  Популярное сейчас
                </TextShimmer>
              ) : (
                "Популярное сейчас"
              )}
            </span>
          </button>
          <button
            onClick={() => onTabChange("movies")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === "movies"
                ? "bg-background ring-2 ring-ring ring-offset-2"
                : ""
            }`}
            style={{ userSelect: 'none' }}
          >
            <span style={{ userSelect: 'none' }}>
              {activeTab === "movies" ? (
                <TextShimmer 
                  key="shimmer-movies" 
                  duration={2} 
                  spread={1}
                  isVisible={!isLoading}
                  delay={500}
                >
                  Фильмы
                </TextShimmer>
              ) : (
                "Фильмы"
              )}
            </span>
          </button>
          <button
            onClick={() => onTabChange("series")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
              activeTab === "series"
                ? "bg-background ring-2 ring-ring ring-offset-2"
                : ""
            }`}
            style={{ userSelect: 'none' }}
          >
            <span style={{ userSelect: 'none' }}>
              {activeTab === "series" ? (
                <TextShimmer 
                  key="shimmer-series" 
                  duration={2} 
                  spread={1}
                  isVisible={!isLoading}
                  delay={500}
                >
                  Сериалы
                </TextShimmer>
              ) : (
                "Сериалы"
              )}
            </span>
          </button>
        </>
      )}
    </div>
  ) : null
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
    containScroll: "trimSnaps",
    skipSnaps: false,
  })

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true)
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true)

  const handleAdultContentClick = (movie) => {
    setSelectedAdultMovie(movie)
    setIsAdultDialogOpen(true)
  }

  const handleAdultDialogClose = () => {
    setIsAdultDialogOpen(false)
    setSelectedAdultMovie(null)
  }

  const handleAccessGranted = (movie) => {
    // Здесь будет логика для открытия фильма после успешной проверки PIN
    console.log('Доступ к контенту 18+ разрешен:', movie.title)
  }

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev()
  }, [emblaApi])

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext()
  }, [emblaApi])

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev())
    setNextBtnDisabled(!emblaApi.canScrollNext())
  }, [])

  useEffect(() => {
    if (!emblaApi) return

    onSelect(emblaApi)
    emblaApi.on("reInit", onSelect)
    emblaApi.on("select", onSelect)
  }, [emblaApi, onSelect])

  // Сброс позиции слайдера при изменении activeTab или movies
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0)
    }
  }, [emblaApi, activeTab, movies])

  // Создаем массив скелетонов для отображения во время загрузки
  const skeletonArray = Array.from({ length: 18 }, (_, index) => ({ id: `skeleton-${index}` }))
  
  // Определяем что отображать: скелетоны или реальные данные
  const displayItems = isLoading ? skeletonArray : (movies || [])
  
  if (!isLoading && (!movies || movies.length === 0)) {
    return null
  }

  return (
    <section className="relative" style={{ userSelect: 'none' }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {customTabs}
          {sectionTitle && (
            <h2 className="text-xl font-semibold text-muted-foreground" style={{ userSelect: 'none' }}>{sectionTitle}</h2>
          )}
          {title && <h2 className="text-2xl font-bold text-foreground" style={{ userSelect: 'none' }}>{title}</h2>}
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`p-2 rounded-full border border-border transition-all duration-200 ${
              prevBtnDisabled
                ? "opacity-50 cursor-not-allowed bg-muted"
                : "hover:bg-accent hover:text-accent-foreground bg-background"
            }`}
            onClick={scrollPrev}
            disabled={prevBtnDisabled}
            aria-label="Предыдущий слайд"
            style={{ userSelect: 'none' }}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className={`p-2 rounded-full border border-border transition-all duration-200 ${
              nextBtnDisabled
                ? "opacity-50 cursor-not-allowed bg-muted"
                : "hover:bg-accent hover:text-accent-foreground bg-background"
            }`}
            onClick={scrollNext}
            disabled={nextBtnDisabled}
            aria-label="Следующий слайд"
            style={{ userSelect: 'none' }}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Слайдер заходит за боковое меню */}
      <div 
        className={`overflow-hidden relative z-10 -ml-6 pl-6 pb-6 ${
          sidebarOpen 
            ? "lg:-ml-[calc(1.5rem+240px)] lg:pl-[calc(1.5rem+240px)]" 
            : "lg:-ml-[calc(1.5rem+64px)] lg:pl-[calc(1.5rem+64px)]"
        }`}
        ref={emblaRef}
        style={{ userSelect: 'none' }}
      >
        <div className="flex gap-4">
          {displayItems.map((item, index) => (
            <div
              key={item.id}
              className="w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px] flex-shrink-0 min-w-0 relative z-20"
            >
              {isLoading ? (
                <MovieCardSkeleton />
              ) : (
                <MovieCardWithSkeleton 
                  movie={item} 
                  onAdultContentClick={handleAdultContentClick} 
                  isNew={newMovies.includes(item.id)}
                  showContentTypeBadge={shouldShowContentTypeBadge()}
                  position={index + 1}
                  showPosition={activeTab === "watching"}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      <AdultContentDialog
        isOpen={isAdultDialogOpen}
        onClose={handleAdultDialogClose}
        movie={selectedAdultMovie}
        onAccessGranted={handleAccessGranted}
      />
    </section>
  )
}

export default MovieSlider
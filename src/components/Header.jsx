"use client";
import {
  Menu,
  Search,
  X,
  Sun,
  Moon,
  Maximize,
  Minimize,
  Loader,
  Settings,
  Lock,
  Unlock,
  Baby,
  Info,
  Globe,
  Star,
  Shield,
  Sliders,
  Palette,
  TrendingDown,
  Minus,
  TrendingUp,
  Award,
  ThumbsDown,
  Meh,
  ThumbsUp,
  Zap,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { LiquidWeb } from "liquid-web/react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTheme } from "next-themes";
import { Button } from "../../components/ui/button";
import { useToast } from "../../hooks/use-toast";
import { useParentalControl } from "../contexts/ParentalControlContext";

import AdultContentDialog from "./AdultContentDialog";
import SettingsModal from "./SettingsModal";
import MovieCardWithSkeleton from "./MovieCardWithSkeleton";
import PlayerModal from "./PlayerModal";
import useEmblaCarousel from "embla-carousel-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

// Компонент слайдера для результатов поиска
const SearchResultsSlider = ({
  movies,
  isLoading,
  filterTabs,
  activeFilterTab,
  onFilterTabChange,
  onMovieClick,
}) => {
  const [selectedAdultMovie, setSelectedAdultMovie] = useState(null);
  const [isAdultDialogOpen, setIsAdultDialogOpen] = useState(false);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    slidesToScroll: 1,
    dragFree: true,
    containScroll: "trimSnaps",
    skipSnaps: false,
  });

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  // Преобразование данных из API Vokino в формат MovieCard
  const transformMovieData = (apiMovie) => {
    return {
      id: apiMovie.id || apiMovie.details?.id || Math.random().toString(36),
      title:
        apiMovie.details?.name ||
        apiMovie.title ||
        apiMovie.name ||
        "Неизвестное название",
      poster:
        apiMovie.details?.poster ||
        apiMovie.poster ||
        "https://kinohost.web.app/no_poster.png",
      year: apiMovie.details?.released || apiMovie.year || "",
      genre: apiMovie.details?.genre || apiMovie.genre || [],
      rating:
        apiMovie.details?.rating_kp ||
        apiMovie.details?.rating_imdb ||
        apiMovie.rating ||
        "0.0",
      age: apiMovie.details?.age_rating || apiMovie.age || "0",
      description: apiMovie.details?.description || apiMovie.description || "",
      // Дополнительные поля для совместимости
      details: apiMovie.details || {},
    };
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

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const displayItems = isLoading
    ? Array.from({ length: 12 }, (_, index) => ({ id: `skeleton-${index}` }))
    : (movies || []).map(transformMovieData);

  if (!isLoading && (!movies || movies.length === 0)) {
    return null;
  }

  return (
    <div className="relative">
      {/* Навигационные кнопки и табы фильтрации */}
      <div className="flex items-center justify-between mb-4">
        {/* Табы фильтрации */}
        <div className="bg-muted text-muted-foreground rounded-lg p-1 flex items-center gap-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterTabChange(tab.id)}
              className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                activeFilterTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50 hover:text-foreground"
              }`}
            >
              {tab.icon === "AZ" && (
                <span className="w-3 h-3 text-xs font-bold">AZ</span>
              )}
              {tab.icon === "Calendar" && (
                <span className="w-3 h-3 text-xs">📅</span>
              )}
              {tab.icon === "Star" && <Star className="w-3 h-3" />}
              {tab.title}
            </button>
          ))}
        </div>

        {/* Кнопки навигации */}
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
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Слайдер */}
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">
          {displayItems.map((movie, index) => (
            <div
              key={movie.id || index}
              className="w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px] flex-shrink-0"
            >
              {isLoading ? (
                <div className="space-y-2">
                  <div className="aspect-[2/3] bg-muted rounded-lg animate-pulse" />
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
              ) : (
                <MovieCardWithSkeleton
                  movie={movie}
                  onAdultContentClick={handleAdultContentClick}
                  onMovieClick={onMovieClick}
                  isNew={false}
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
    </div>
  );
};

const Header = ({
  toggleSidebar,
  onSearchFocus,
  isSearchActive,
  isSearchAnimating,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null); // 'setup' | 'disable' | null

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [activeInfoTab, setActiveInfoTab] = useState("general");
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [isThemeApplying, setIsThemeApplying] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [activeFilterTab, setActiveFilterTab] = useState("title"); // новое состояние для активного таба фильтрации
  const [selectedMovieForPlayer, setSelectedMovieForPlayer] = useState(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(""); // для отображения в заголовке модалки
  const [voiceSearchMessage, setVoiceSearchMessage] = useState(""); // новое состояние для сообщения голосового поиска
  const [showVoiceSearchEffect, setShowVoiceSearchEffect] = useState(false); // новое состояние для эффекта голосового поиска
  const searchInputRef = useRef(null);
  const recognitionRef = useRef(null); // Реф для хранения объекта распознавания
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Для предотвращения гидратации используем состояние mounted
  useEffect(() => {
    setMounted(true);
    // Проверяем поддержку Speech Recognition API
    if (typeof window !== "undefined") {
      setSpeechSupported(
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window
      );
    }
  }, []);

  const darkMode = theme === "dark";

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };
  // Безопасное использование useParentalControl с проверкой контекста
  let isParentalControlEnabled = false;
  let hasPin = false;
  let enableParentalControl = () => {};
  let disableParentalControl = () => {};
  
  try {
    const parentalControl = useParentalControl();
    isParentalControlEnabled = parentalControl.isParentalControlEnabled;
    hasPin = parentalControl.hasPin;
    enableParentalControl = parentalControl.enableParentalControl;
    disableParentalControl = parentalControl.disableParentalControl;
  } catch (error) {
    // Контекст недоступен, используем значения по умолчанию
    console.warn('ParentalControlContext not available, using defaults');
  }


  // Конфигурация табов фильтрации для модалки поиска
  const filterTabs = [
    { id: "title", title: "По названию", icon: "AZ" },
    { id: "year", title: "По году", icon: "Calendar" },
    { id: "rating", title: "По рейтингу", icon: "Star" },
  ];

  // Функция сортировки результатов поиска
  const getSortedSearchResults = () => {
    if (!searchResults || searchResults.length === 0) return [];

    const sortedResults = [...searchResults];

    switch (activeFilterTab) {
      case "title":
        return sortedResults.sort((a, b) => {
          const titleA = (a.details?.name || a.title || "").toLowerCase();
          const titleB = (b.details?.name || b.title || "").toLowerCase();
          return titleA.localeCompare(titleB, "ru");
        });

      case "year":
        return sortedResults.sort((a, b) => {
          const yearA = parseInt(a.details?.released || a.year || "0");
          const yearB = parseInt(b.details?.released || b.year || "0");
          return yearB - yearA; // от новых к старым
        });

      case "rating":
        return sortedResults.sort((a, b) => {
          const ratingA = parseFloat(
            a.details?.rating_kp || a.details?.rating_imdb || a.rating || "0"
          );
          const ratingB = parseFloat(
            b.details?.rating_kp || b.details?.rating_imdb || b.rating || "0"
          );
          return ratingB - ratingA; // от высокого к низкому
        });

      default:
        return sortedResults;
    }
  };

  // Обработчик смены таба фильтрации
  const handleFilterTabClick = (tabId) => {
    if (tabId !== activeFilterTab) {
      setActiveFilterTab(tabId);
    }
  };

  // Обработчик клика по фильму в результатах поиска
  const handleMovieClick = (movie) => {
    // Сначала закрываем модалку поиска
    setShowSearchResults(false);
    setIsSearchFocused(false);
    onSearchFocus && onSearchFocus(false);

    // Преобразуем данные фильма в правильный формат
    const transformedMovie = {
      id: movie.id || movie.details?.id || Math.random().toString(36),
      ident: movie.ident || movie.id, // Важно для PlayerModal
      title:
        movie.details?.name ||
        movie.title ||
        movie.name ||
        "Неизвестное название",
      poster:
        movie.details?.poster ||
        movie.poster ||
        "https://kinohost.web.app/no_poster.png",
      year: movie.details?.released || movie.year || "",
      genre: movie.details?.genre || movie.genre || [],
      rating:
        movie.details?.rating_kp ||
        movie.details?.rating_imdb ||
        movie.rating ||
        "0.0",
      age: movie.details?.age_rating || movie.age || "0",
      description: movie.details?.description || movie.description || "",
      details: movie.details || {},
    };

    // Затем открываем PlayerModal с преобразованным фильмом
    setSelectedMovieForPlayer(transformedMovie);
    setIsPlayerModalOpen(true);
  };

  // Обработчик закрытия PlayerModal
  const handlePlayerModalClose = () => {
    setIsPlayerModalOpen(false);
    setSelectedMovieForPlayer(null);
  };

  const infoTabs = [
    { id: "general", title: "Общее", icon: Globe },
    { id: "ratings", title: "Рейтинги", icon: Star },
    { id: "security", title: "Безопасность", icon: Shield },
    { id: "settings", title: "Настройки", icon: Sliders },
    { id: "interface", title: "Интерфейс", icon: Palette },
  ];

  const handleInfoTabClick = (tabId) => {
    if (tabId !== activeInfoTab) {
      setActiveInfoTab(tabId);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Ошибка при переключении полноэкранного режима:", error);
    }
  };

  const handleParentalControlClick = () => {
    if (!isParentalControlEnabled) {
      // Родительский контроль выключен - включаем (setup режим)
      setDialogMode("setup");
    } else {
      // Родительский контроль включен - отключаем (disable режим)
      setDialogMode("disable");
    }
  };

  const handleDialogClose = () => {
    setDialogMode(null);
  };

  const handlePinSetup = () => {
    setDialogMode(null);
  };

  const handlePinDisable = () => {
    setDialogMode(null);
  };

  const handleSearchFocus = () => {
    // Убираем активацию затемнения при простом фокусе на поле ввода
    // Затемнение будет активироваться только при показе результатов поиска
  };

  const handleSearchBlur = () => {
    // Убираем деактивацию затемнения при потере фокуса
    // Затемнение управляется только через showSearchResults
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Обработчик нажатия Enter в поле поиска
  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      searchMovies(searchQuery.trim(), true); // Очищаем поле после поиска из хедера
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowSearchResults(false);
    setCurrentSearchQuery(""); // Очищаем также сохраненный запрос

    // Деактивируем оверлей при очистке поиска
    setIsSearchFocused(false);
    onSearchFocus && onSearchFocus(false);

    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Функция поиска фильмов
  const searchMovies = async (query, shouldClearInput = true) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    // Сбрасываем фильтр на "По названию" при новом поиске
    setActiveFilterTab("title");

    try {
      const url = `https://api.vokino.tv/v2/search?name=${encodeURIComponent(
        query
      )}&page=1`;
      console.log("API URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Ошибка поиска");
      }

      const data = await response.json();
      console.log("Raw API response data:", data);

      // Используем data.channels согласно структуре API
      if (data && data.channels && Array.isArray(data.channels)) {
        console.log("First movie data structure:", data.channels[0]);
        setSearchResults(data.channels.slice(0, 12)); // Ограничиваем до 12 результатов
        setShowSearchResults(true);

        // Сохраняем поисковый запрос для отображения в заголовке модалки
        setCurrentSearchQuery(query);

        // Очищаем поле поиска только если shouldClearInput = true (для поиска из хедера)
        if (shouldClearInput) {
          setSearchQuery("");
        }

        // Активируем оверлей при показе результатов
        setIsSearchFocused(true);
        onSearchFocus && onSearchFocus(true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error("Ошибка поиска:", error);
      toast({
        title: "Ошибка поиска",
        description: "Не удалось выполнить поиск. Попробуйте еще раз.",
        variant: "destructive",
      });
      setSearchResults([]);
      setShowSearchResults(false);
    } finally {
      setIsSearching(false);
    }
  };

  // Голосовой поиск
  const handleVoiceSearch = () => {
    if (!speechSupported) {
      // Показываем визуальный эффект вместо тоста
      setVoiceSearchMessage("Голосовой поиск недоступен");
      setShowVoiceSearchEffect(true);
      setTimeout(() => setShowVoiceSearchEffect(false), 3000);
      return;
    }

    if (isListening) {
      // Останавливаем запись немедленно и сбрасываем все состояния
      if (recognitionRef.current) {
        recognitionRef.current.stop(); // Останавливаем распознавание
        recognitionRef.current = null; // Очищаем ссылку
      }
      setIsListening(false);
      setShowVoiceSearchEffect(false);

      // При ручной остановке голосового поиска затемнение не нужно деактивировать,
      // так как оно не было активировано

      return;
    }

    // Начинаем запись немедленно без задержек
    // Затемнение будет активировано только при показе результатов поиска
    setIsListening(true);

    // Показываем эффект начала записи
    setVoiceSearchMessage(
      "Говорите... Произнесите название фильма или сериала"
    );
    setShowVoiceSearchEffect(true);

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition; // Сохраняем ссылку на объект

    recognition.lang = "ru-RU";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      // Обновляем сообщение при начале записи
      setVoiceSearchMessage(
        "Говорите... Произнесите название фильма или сериала"
      );
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
      setShowVoiceSearchEffect(false); // Скрываем эффект сразу после распознавания

      // Очищаем ссылку на объект распознавания
      recognitionRef.current = null;

      // Автоматически запускаем поиск после голосового ввода с очисткой поля
      // Затемнение будет активировано в searchMovies при показе результатов
      searchMovies(transcript, true);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      setShowVoiceSearchEffect(false); // Скрываем эффект при ошибке

      // Очищаем ссылку на объект распознавания
      recognitionRef.current = null;

      // Показываем эффект ошибки
      let errorMessage = "Ошибка распознавания речи";
      switch (event.error) {
        case "no-speech":
          errorMessage = "Речь не обнаружена. Попробуйте еще раз";
          break;
        case "audio-capture":
          errorMessage = "Микрофон не найден или недоступен";
          break;
        case "not-allowed":
          errorMessage = "Разрешите доступ к микрофону для голосового поиска";
          break;
        default:
          errorMessage = `Ошибка: ${event.error}`;
      }

      // Показываем ошибку на короткое время
      setVoiceSearchMessage(errorMessage);
      setShowVoiceSearchEffect(true);
      setTimeout(() => setShowVoiceSearchEffect(false), 2000);

      // При ошибке голосового поиска затемнение не нужно деактивировать,
      // так как оно не было активировано
    };

    recognition.onend = () => {
      // Убедимся, что состояние сброшено
      if (isListening) {
        setIsListening(false);
      }

      // Очищаем ссылку на объект распознавания
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }

      // Скрываем эффект при завершении
      setShowVoiceSearchEffect(false);

      // При завершении голосового поиска затемнение не нужно деактивировать,
      // так как оно управляется только через showSearchResults
    };

    try {
      recognition.start();
    } catch (error) {
      setIsListening(false);
      setShowVoiceSearchEffect(false); // Скрываем эффект при ошибке запуска

      // Очищаем ссылку на объект распознавания
      recognitionRef.current = null;

      // Показываем эффект ошибки запуска
      setVoiceSearchMessage("Не удалось запустить распознавание речи");
      setShowVoiceSearchEffect(true);
      setTimeout(() => setShowVoiceSearchEffect(false), 2000);

      // При ошибке запуска голосового поиска затемнение не нужно деактивировать,
      // так как оно не было активировано
    }
  };

  const handleThemeConfirm = async () => {
    setIsThemeApplying(true);

    // Применяем тему сразу
    toggleTheme();

    // Ждем пока тема применится визуально (CSS transitions)
    setTimeout(() => {
      setIsThemeApplying(false);
      setShowThemeDialog(false);
    }, 600); // Даем время на CSS transitions (300ms + небольшой запас)
  };

  const handleThemeCancel = () => {
    setShowThemeDialog(false);
  };

  const renderInfoTabContent = () => {
    switch (activeInfoTab) {
      case "general":
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="font-semibold text-foreground mb-3 text-lg border-b border-border pb-2">
                О платформе
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Современная платформа для просмотра фильмов и сериалов с богатым
                функционалом и удобным интерфейсом. Поддерживает различные
                режимы просмотра и персонализацию контента.
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="font-semibold text-foreground mb-3 text-base border-b border-border pb-2">
                Основные возможности
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-2 bg-background/50 rounded">
                  <span className="text-sm text-muted-foreground">
                    Большая коллекция фильмов и сериалов
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-background/50 rounded">
                  <span className="text-sm text-muted-foreground">
                    Поиск по названию и жанрам
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-background/50 rounded">
                  <span className="text-sm text-muted-foreground">
                    Категоризация контента
                  </span>
                </div>
                <div className="flex items-center gap-3 p-2 bg-background/50 rounded">
                  <span className="text-sm text-muted-foreground">
                    Возрастные ограничения
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      case "ratings":
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="font-semibold text-foreground mb-3 text-lg border-b border-border pb-2">
                Система рейтингов
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Рейтинг рассчитывается на основе данных из трех источников:
              </p>
              <div className="grid grid-cols-1 gap-2 mb-4">
                <div className="bg-background/50 p-3 rounded flex items-center gap-3">
                  <Star className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">
                      КиноПоиск
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      — российская база данных
                    </span>
                  </div>
                </div>
                <div className="bg-background/50 p-3 rounded flex items-center gap-3">
                  <Star className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">IMDB</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      — международная база данных
                    </span>
                  </div>
                </div>
                <div className="bg-background/50 p-3 rounded flex items-center gap-3">
                  <Star className="w-4 h-4 text-purple-500 flex-shrink-0" />
                  <div>
                    <span className="font-medium text-foreground">TMDB</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      — The Movie Database
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-medium mb-4">
                Итоговый рейтинг — среднее арифметическое всех доступных оценок
              </p>
            </div>
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="font-semibold text-foreground mb-3 text-base border-b border-border pb-2">
                Отображение рейтинга
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded">
                  <div className="w-8 h-8 bg-red-500/20 rounded flex items-center justify-center">
                    <ThumbsDown className="w-4 h-4 text-red-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      &lt; 5.5
                    </div>
                    <div className="text-xs text-muted-foreground">Низкий</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded">
                  <div className="w-8 h-8 bg-gray-500/20 rounded flex items-center justify-center">
                    <Meh className="w-4 h-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      5.6-7.4
                    </div>
                    <div className="text-xs text-muted-foreground">Средний</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded">
                  <div className="w-8 h-8 bg-green-500/20 rounded flex items-center justify-center">
                    <ThumbsUp className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      7.5-8.2
                    </div>
                    <div className="text-xs text-muted-foreground">Высокий</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-background/50 rounded">
                  <div className="w-8 h-8 bg-green-400/20 rounded flex items-center justify-center">
                    <Zap className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      8.3-10
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Отличный
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "security":
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="font-semibold text-foreground mb-3 text-lg border-b border-border pb-2">
                Безопасность и контроль
              </div>
              <div className="space-y-4">
                <div className="bg-background/50 p-4 rounded">
                  <div className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Baby className="h-4 w-4 text-pink-500" />
                    Kids режим
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Безопасная среда для детей с ограниченным контентом.
                    Доступны только мультфильмы и мультсериалы, подходящие для
                    детского просмотра. Интерфейс адаптирован для детей с яркими
                    цветами.
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded">
                  <div className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-red-500" />
                    Родительский контроль
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Система защиты контента 18+ с помощью PIN-кода. Позволяет
                    ограничить доступ к взрослому контенту и создать безопасную
                    среду для семейного просмотра.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="font-semibold text-foreground mb-3 text-lg border-b border-border pb-2">
                Персонализация
              </div>
              <div className="space-y-4">
                <div className="bg-background/50 p-4 rounded">
                  <div className="font-medium text-foreground mb-2">
                    Избранное
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Сохраняйте понравившиеся фильмы и сериалы в личную коллекцию
                    для быстрого доступа. Создавайте персональные списки и
                    управляйте своими предпочтениями.
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded">
                  <div className="font-medium text-foreground mb-3">
                    Настройки отображения
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3 p-2 rounded">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Показывать детали
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Отображение информации о фильме на карточке
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-2 rounded">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          Рейтинг иконками
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Переключение между иконками и цифрами
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "interface":
        return (
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <div className="font-semibold text-foreground mb-3 text-lg border-b border-border pb-2">
                Интерфейс и дизайн
              </div>
              <div className="space-y-4">
                <div className="bg-background/50 p-4 rounded">
                  <div className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Sun className="h-4 w-4 text-yellow-500" />
                    Темы оформления
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Поддержка светлой и темной темы для комфортного просмотра в
                    любое время суток. Автоматическое переключение в зависимости
                    от времени или ручная настройка.
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded">
                  <div className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-blue-500" />
                    Адаптивный дизайн
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Платформа оптимизирована для всех устройств: компьютеры,
                    планшеты и смартфоны. Поддержка полноэкранного режима для
                    максимального погружения.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="sticky top-0 z-[80]">
        <LiquidWeb
          options={{
            scale: 32,
            blur: 0,
            saturation: 10,
            aberration: 60,
            mode: 'standart'
          }}
        >
          <header
            className="main-header bg-background/80 border-b border-border transition-all duration-300"
            style={{
              borderBottomLeftRadius: '93px',
              borderTopRightRadius: '163px'
            }}
          >
        <div className="flex items-center justify-between px-6 py-3">
          {/* Левая часть - кнопка меню, логотип и поиск */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-secondary transition-colors flex-shrink-0"
              aria-label="Переключить меню"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>

            {/* Логотип */}
            <div className="flex-shrink-0">
              {/* Логотип удален */}
            </div>

            {/* Поиск перемещен в левую часть */}
            <div className="relative hidden md:block z-[80]">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[100]">
                <Search className="w-4 h-4 text-foreground" />
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                placeholder="Поиск фильмов и сериалов..."
                className="pl-10 pr-20 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 w-80 transition-all duration-200 relative z-[90]"
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                onChange={handleSearchChange}
                onKeyPress={handleSearchKeyPress}
              />
              {/* Кнопка голосового поиска */}
              {speechSupported && (
                <button
                  onClick={handleVoiceSearch}
                  className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-[90] ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : "bg-muted hover:bg-blue-200/80 dark:hover:bg-blue-900/30"
                  }`}
                  title={isListening ? "Остановить запись" : "Голосовой поиск"}
                  disabled={!speechSupported}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5 text-white transition-colors duration-200" />
                  ) : (
                    <Mic className="w-5 h-5 text-muted-foreground hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200" />
                  )}
                </button>
              )}
              {searchQuery && (
                <button
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClearSearch}
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full bg-muted hover:bg-red-200/80 dark:hover:bg-red-900/30 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-[90]"
                  title="Очистить поиск"
                >
                  <X className="w-3.5 h-3.5 text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors duration-200" />
                </button>
              )}
            </div>
          </div>

          {/* Правая часть - иконки */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowThemeDialog(true)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title={
                mounted
                  ? darkMode
                    ? "Светлая тема"
                    : "Темная тема"
                  : "Переключить тему"
              }
              suppressHydrationWarning
            >
              {!mounted ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : darkMode ? (
                <Sun className="w-5 h-5 text-foreground" />
              ) : (
                <Moon className="w-5 h-5 text-foreground" />
              )}
            </button>



            <button
              onClick={handleParentalControlClick}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Родительский контроль"
            >
              {isParentalControlEnabled ? (
                <Lock className="w-5 h-5 text-foreground" />
              ) : (
                <Unlock className="w-5 h-5 text-foreground" />
              )}
            </button>

            <AdultContentDialog
              isOpen={dialogMode !== null}
              onClose={handleDialogClose}
              setupMode={dialogMode === "setup"}
              disableMode={dialogMode === "disable"}
              onPinSetup={handlePinSetup}
              onPinDisable={handlePinDisable}
            />



            <button
              onClick={() => {
                setActiveInfoTab("general");
                setShowInfoDialog(true);
              }}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="О платформе"
            >
              <Info className="w-5 h-5 text-foreground" />
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title="Настройки"
            >
              <Settings className="w-5 h-5 text-foreground" />
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
              title={
                isFullscreen
                  ? "Выйти из полноэкранного режима"
                  : "Полноэкранный режим"
              }
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-foreground" />
              ) : (
                <Maximize className="w-5 h-5 text-foreground" />
              )}
            </button>

            <AlertDialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
              <AlertDialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl lg:max-w-2xl xl:max-w-3xl h-[65vh] flex flex-col">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2 text-xl">
                    <Info className="h-6 w-6 text-blue-500" />О платформе
                    Streaming Service
                  </AlertDialogTitle>
                </AlertDialogHeader>

                {/* Табы */}
                <div className="mb-6">
                  <div className="bg-muted text-muted-foreground rounded-lg p-1 overflow-x-auto w-fit">
                    <div className="flex items-center gap-1">
                      {infoTabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => handleInfoTabClick(tab.id)}
                            className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-2.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-w-fit ${
                              activeInfoTab === tab.id
                                ? "bg-background text-foreground shadow-sm"
                                : "hover:bg-background/50 hover:text-foreground"
                            }`}
                          >
                            <IconComponent className="w-4 h-4 flex-shrink-0" />
                            <span>{tab.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Контент вкладок */}
                <AlertDialogDescription className="text-left flex-1 overflow-y-auto pr-2">
                  {renderInfoTabContent()}
                </AlertDialogDescription>

                <AlertDialogFooter className="mt-6">
                  <AlertDialogAction
                    onClick={() => setShowInfoDialog(false)}
                    className="px-6"
                  >
                    Понятно
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <SettingsModal
              isOpen={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
            />

            {/* Диалог подтверждения смены темы */}
            <AlertDialog
              open={showThemeDialog}
              onOpenChange={setShowThemeDialog}
            >
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    {darkMode ? (
                      <>
                        <Sun className="h-5 w-5 text-yellow-500" />
                        Переход на светлую тему
                      </>
                    ) : (
                      <>
                        <Moon className="h-5 w-5 text-blue-500" />
                        Переход на темную тему
                      </>
                    )}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {darkMode
                      ? "Вы собираетесь переключиться на светлую тему. Это изменит цветовую схему всего интерфейса на более светлую."
                      : "Вы собираетесь переключиться на темную тему. Это изменит цветовую схему всего интерфейса на более темную, что может быть легче для глаз в условиях низкой освещенности."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={handleThemeCancel}
                    disabled={isThemeApplying}
                  >
                    Отмена
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleThemeConfirm}
                    disabled={isThemeApplying}
                    className={`${
                      darkMode
                        ? "bg-white hover:bg-gray-100 text-black border border-gray-300"
                        : "bg-gray-800 hover:bg-gray-900"
                    } ${
                      isThemeApplying ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isThemeApplying ? (
                      <div
                        className={`flex items-center gap-2 ${
                          darkMode ? "text-black" : "text-white"
                        }`}
                      >
                        <Loader className="w-4 h-4 animate-spin" />
                        Применение...
                      </div>
                    ) : darkMode ? (
                      "Перейти на светлую"
                    ) : (
                      "Перейти на темную"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Оверлей затемнения в хедере удален. Затемнение теперь глобальное. */}
          {/* Удалены дублирующиеся оверлеи, которые вызывали прыжки элементов */}
        </div>
          </header>
        </LiquidWeb>
      </div>

      {/* Визуальный эффект голосового поиска внизу экрана */}
      {showVoiceSearchEffect && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100] pointer-events-none">
          <div className="relative bg-background/80 backdrop-blur-lg border border-blue-500/30 rounded-xl p-4 shadow-lg max-w-md w-full mx-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                  <Mic className="w-5 h-5 text-blue-400" />
                </div>
                <div className="absolute inset-0 w-10 h-10 bg-blue-400 rounded-full animate-ping opacity-20"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">
                  Голосовой поиск
                </p>
                <p className="text-muted-foreground text-xs truncate">
                  {voiceSearchMessage}
                </p>
              </div>
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 animate-pulse opacity-50"></div>
          </div>
        </div>
      )}

      {/* Модалка поисковых результатов через портал */}
      {showSearchResults &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
              onClick={() => {
                setShowSearchResults(false);
                setCurrentSearchQuery(""); // Очищаем сохраненный запрос
                // Деактивируем оверлей при закрытии результатов
                setIsSearchFocused(false);
                onSearchFocus && onSearchFocus(false);
              }}
            />

            {/* Модалка с результатами */}
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-background rounded-xl shadow-2xl border border-border max-w-6xl w-full max-h-[85vh] overflow-hidden pointer-events-auto">
                {/* Заголовок модалки */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <h3 className="text-xl font-semibold text-foreground">
                    Результаты поиска: "{currentSearchQuery}"
                  </h3>
                  <button
                    onClick={() => {
                      setShowSearchResults(false);
                      setCurrentSearchQuery(""); // Очищаем сохраненный запрос
                      // Деактивируем оверлей при закрытии результатов
                      setIsSearchFocused(false);
                      onSearchFocus && onSearchFocus(false);
                    }}
                    className="p-2 rounded-lg hover:bg-secondary transition-colors"
                    title="Закрыть"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                {/* Содержимое модалки */}
                <div className="p-6">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-16">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <Loader className="w-6 h-6 animate-spin" />
                        <span className="text-lg">Поиск...</span>
                      </div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <SearchResultsSlider
                      movies={getSortedSearchResults()}
                      isLoading={isSearching}
                      filterTabs={filterTabs}
                      activeFilterTab={activeFilterTab}
                      onFilterTabChange={handleFilterTabClick}
                      onMovieClick={handleMovieClick}
                    />
                  ) : (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground mb-2 text-lg">
                        Ничего не найдено
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Попробуйте изменить запрос
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>,
          document.body
        )}

      {/* PlayerModal для фильмов из поиска */}
      <PlayerModal
        movie={selectedMovieForPlayer}
        isOpen={isPlayerModalOpen}
        onClose={handlePlayerModalClose}
      />
    </>
  );
};

export default Header;

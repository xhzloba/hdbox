"use client";
import {
  Menu,
  Search,
  X,
  Maximize,
  Minimize,
  Loader,
  Settings,
  Lock,
  Unlock,
  Mic,
  MicOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

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
    if (emblaApi) {
      onSelect(emblaApi);
      emblaApi.on("reInit", onSelect);
      emblaApi.on("select", onSelect);

      return () => {
        emblaApi.off("reInit", onSelect);
        emblaApi.off("select", onSelect);
      };
    }
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
  sidebarOpen,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [dialogMode, setDialogMode] = useState(null); // 'setup' | 'disable' | null

  const [showSettingsModal, setShowSettingsModal] = useState(false);

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
  const [showSearchInput, setShowSearchInput] = useState(false); // состояние для показа поля поиска в хедере
  const [currentTime, setCurrentTime] = useState(new Date()); // состояние для текущего времени
  const searchInputRef = useRef(null);
  const recognitionRef = useRef(null); // Реф для хранения объекта распознавания
  const { toast } = useToast();
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

  // Обновление времени каждую секунду
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Функция для форматирования времени
  const formatDateTime = (date) => {
    const days = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
    const months = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];

    const dayOfWeek = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${dayOfWeek}, ${day} ${month}. ${hours}:${minutes}`;
  };


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
    // Сначала закрываем результаты поиска и поле поиска
    setShowSearchResults(false);
    setShowSearchInput(false);
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
      searchMovies(searchQuery.trim(), false); // Не очищаем поле после поиска
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

  // Функция для toggle поисковой строки
  const toggleSearchInput = () => {
    if (showSearchInput) {
      // Скрываем поиск и очищаем все состояния
      setShowSearchInput(false);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      setCurrentSearchQuery("");
      setIsSearchFocused(false);
      onSearchFocus && onSearchFocus(false);
    } else {
      // Показываем поиск и фокусируемся на поле ввода
      setShowSearchInput(true);
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 100);
    }
  };

  // Функция поиска фильмов
  const searchMovies = async (query, shouldClearInput = false) => {
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

      // Автоматически запускаем поиск после голосового ввода без очистки поля
      // Затемнение будет активировано в searchMovies при показе результатов
      searchMovies(transcript, false);
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





  return (
    <>
      <header
        className="sticky top-0 z-[80] bg-background/80 backdrop-blur-lg border-b border-border transition-all duration-300"
        style={{
          borderBottomLeftRadius: '100px',
          borderTopLeftRadius: '100px',
          borderBottomRightRadius: '100px',
          borderTopRightRadius: '100px',
          marginLeft: '37px',
          marginRight: '37px',
          boxShadow: 'inset 0px 5px 20px 0px #000000',
          marginTop: '25px',
          marginBottom: '20px',
          height: '64px' // Фиксированная высота хедера
        }}
      >
        <div className="flex items-center justify-between px-6 py-3 h-full relative">
          {/* Левая часть - кнопка меню, кнопка поиска, логотип */}
          <div className="flex items-center gap-3 relative">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg transition-all duration-300 flex-shrink-0 group hover:animate-pulse hover:bg-blue-500"
              style={{
                background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
                boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
                borderTop: '1px solid rgb(84, 84, 84)'
              }}
              aria-label="Переключить меню"
            >
              <div className="relative w-5 h-5">
                <Menu 
                  className={`absolute inset-0 w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transform ${
                    sidebarOpen ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0'
                  }`} 
                />
                <X 
                  className={`absolute inset-0 w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transform ${
                    sidebarOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
                  }`} 
                />
              </div>
            </button>

            {/* Кнопка поиска рядом с меню */}
            <button
              onClick={toggleSearchInput}
              className="p-2 rounded-lg transition-all duration-300 flex-shrink-0 relative z-[10000] group hover:animate-pulse"
              style={{
                background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
                boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
                borderTop: '1px solid rgb(84, 84, 84)'
              }}
              title="Поиск фильмов"
            >
              <Search className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </button>

            {/* Логотип */}
            <div className="flex-shrink-0">
              {/* Логотип удален */}
            </div>
          </div>

          {/* Поле поиска - абсолютное позиционирование слева от иконки поиска */}
          {showSearchInput && (
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 z-[9998]">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-[9999]">
                  <Search className="w-4 h-4 text-foreground" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  placeholder="Поиск фильмов и сериалов..."
                  className="pl-10 pr-24 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 w-[500px] transition-all duration-200 relative z-[9999]"
                  onFocus={handleSearchFocus}
                  onBlur={(e) => {
                    // Задержка перед скрытием, чтобы можно было кликнуть на результаты
                    setTimeout(() => {
                      if (!e.currentTarget.contains(document.activeElement)) {
                        setShowSearchInput(false);
                        setShowSearchResults(false);
                        setIsSearchFocused(false);
                        onSearchFocus && onSearchFocus(false);
                      }
                    }, 200);
                  }}
                  onChange={handleSearchChange}
                  onKeyPress={handleSearchKeyPress}
                />
                {/* Кнопка закрытия поиска */}
              <button
                onClick={toggleSearchInput}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-[9999] group hover:animate-pulse"
                style={{
                  background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
                  boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
                  borderTop: '1px solid rgb(84, 84, 84)'
                }}
                title="Закрыть поиск"
              >
                <X className="w-4 h-4 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              </button>
              

              {searchQuery && (
                 <button
                   onMouseDown={(e) => e.preventDefault()}
                   onClick={handleClearSearch}
                   className="absolute right-16 top-1/2 transform -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 z-[9999] group hover:animate-pulse"
                   style={{
                     background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
                     boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
                     borderTop: '1px solid rgb(84, 84, 84)'
                   }}
                   title="Очистить поиск"
                 >
                   <X className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                 </button>
               )}
                
                {/* Выпадающий список результатов поиска */}
                {showSearchResults && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 w-[500px] mt-2 bg-background border border-border rounded-lg shadow-2xl max-h-96 overflow-y-auto z-[9999]">
                    {/* Табы фильтрации */}
                    <div className="p-4 border-b border-border">
                      <div className="bg-muted text-muted-foreground rounded-lg p-1 flex items-center gap-1">
                        {filterTabs.map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => handleFilterTabClick(tab.id)}
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
                    </div>
                    
                    {/* Список фильмов */}
                    <div className="p-2">
                      {getSortedSearchResults().slice(0, 8).map((movie) => {
                        const transformedMovie = {
                          id: movie.id || movie.details?.id || Math.random().toString(36),
                          title: movie.details?.name || movie.title || movie.name || "Неизвестное название",
                          poster: movie.details?.poster || movie.poster || "https://kinohost.web.app/no_poster.png",
                          year: movie.details?.released || movie.year || "",
                          genre: movie.details?.genre || movie.genre || [],
                          rating: movie.details?.rating_kp || movie.details?.rating_imdb || movie.rating || "0.0",
                          age: movie.details?.age_rating || movie.age || "0",
                          description: movie.details?.description || movie.description || "",
                          details: movie.details || {},
                        };
                        
                        return (
                          <div
                            key={transformedMovie.id}
                            onClick={() => handleMovieClick(movie)}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer transition-colors"
                          >
                            <img
                              src={transformedMovie.poster}
                              alt={transformedMovie.title}
                              className="w-12 h-16 object-cover rounded flex-shrink-0"
                              onError={(e) => {
                                e.target.src = "https://kinohost.web.app/no_poster.png";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate">
                                {transformedMovie.title}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {transformedMovie.year && (
                                  <span>{transformedMovie.year}</span>
                                )}
                                {transformedMovie.rating && transformedMovie.rating !== "0.0" && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      <span>{transformedMovie.rating}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                              {Array.isArray(transformedMovie.genre) && transformedMovie.genre.length > 0 && (
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {transformedMovie.genre.slice(0, 3).join(", ")}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {/* Сообщение о том, что ничего не найдено */}
                {showSearchResults && searchResults.length === 0 && !isSearching && (
                  <div className="absolute top-full left-0 w-[500px] mt-2 bg-background border border-border rounded-lg shadow-2xl p-4 z-[9999]">
                    <div className="text-center text-muted-foreground">
                      <p>Ничего не найдено</p>
                      <p className="text-sm mt-1">Попробуйте изменить запрос</p>
                    </div>
                  </div>
                )}
                
                {/* Индикатор загрузки */}
                {isSearching && (
                  <div className="absolute top-full left-0 w-[500px] mt-2 bg-background border border-border rounded-lg shadow-2xl p-4 z-[9999]">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Поиск...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Правая часть - иконки */}
          <div className="flex items-center gap-3">
            {/* Иконка голосового поиска (всегда видна) */}
            {speechSupported && (
              <button
                onClick={() => {
                  // Сначала открываем форму поиска
                  setShowSearchInput(true);
                  // Затем запускаем голосовой поиск
                  handleVoiceSearch();
                }}
                className={`p-2 rounded-lg transition-all duration-300 group ${
                  isListening
                    ? "animate-pulse"
                    : "hover:animate-pulse"
                }`}
                style={{
                  background: isListening ? 'rgb(239, 68, 68)' : 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
                  boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
                  borderTop: '1px solid rgb(84, 84, 84)'
                }}
                title={isListening ? "Остановить запись" : "Голосовой поиск"}
                disabled={!speechSupported}
              >
                {isListening ? (
                  <MicOff className="w-5 h-5 text-white" />
                ) : (
                  <Mic className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                )}
              </button>
            )}

            <button
              onClick={handleParentalControlClick}
              className="p-2 rounded-lg transition-all duration-300 group hover:animate-pulse"
              style={{
                background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
                boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
                borderTop: '1px solid rgb(84, 84, 84)'
              }}
              title="Родительский контроль"
            >
              {isParentalControlEnabled ? (
                <Lock className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              ) : (
                <Unlock className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
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
              onClick={() => setShowSettingsModal(true)}
              className="p-2 rounded-lg transition-all duration-300 group hover:animate-pulse"
              style={{
                background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
                boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
                borderTop: '1px solid rgb(84, 84, 84)'
              }}
              title="Настройки"
            >
              <Settings className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            </button>

            {/* Отображение времени и даты */}
            <div className="px-3 py-2 text-sm text-foreground font-medium rounded-lg bg-muted border border-border shadow-lg">
              {formatDateTime(currentTime)}
            </div>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg transition-all duration-300 group hover:animate-pulse"
              style={{
                background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
                boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
                borderTop: '1px solid rgb(84, 84, 84)'
              }}
              title={
                isFullscreen
                  ? "Выйти из полноэкранного режима"
                  : "Полноэкранный режим"
              }
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              ) : (
                <Maximize className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              )}
            </button>



            <SettingsModal
              isOpen={showSettingsModal}
              onClose={() => setShowSettingsModal(false)}
            />


          </div>

          {/* Оверлей затемнения в хедере удален. Затемнение теперь глобальное. */}
          {/* Удалены дублирующиеся оверлеи, которые вызывали прыжки элементов */}
        </div>
      </header>

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

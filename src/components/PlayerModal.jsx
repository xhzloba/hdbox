import React, { useState, useEffect, useContext } from "react";
import { X, Play, Loader2, Heart } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Link } from "../../components/ui/link";
import { TextShimmer } from "../../components/ui/text-shimmer";
import VokinoAPI from "../services/api";
import SettingsContext from "../contexts/SettingsContext";
import FullDescriptionModal from "./FullDescriptionModal";
import { useFavorites } from "../contexts/FavoritesContext";

const PlayerModal = ({ movie, isOpen, onClose }) => {
  const settingsContext = useContext(SettingsContext);
  const defaultPlayer = settingsContext?.defaultPlayer || "renewall";
  const { addToFavorites, removeFromFavorites, isFavorite, isInFavoritesOrPending } = useFavorites();

  // Функция для форматирования времени из HH:MM в читаемый формат
  const formatDuration = (duration) => {
    if (!duration) return null;
    
    let totalMinutes = 0;
    
    // Если duration числовой формат
    if (typeof duration === 'number') {
      totalMinutes = duration;
    } else if (typeof duration === 'string') {
      // Если уже содержит "мин" или "ч", возвращаем как есть
      if (duration.includes('мин') || duration.includes('ч')) {
        return duration;
      }
      
      // Если в формате HH:MM
      if (duration.includes(':')) {
        const [hours, minutes] = duration.split(':').map(num => parseInt(num, 10));
        totalMinutes = hours * 60 + minutes;
      } else {
        // Если просто число в строке
        const numDuration = parseInt(duration, 10);
        if (!isNaN(numDuration)) {
          totalMinutes = numDuration;
        } else {
          return duration;
        }
      }
    } else {
      return duration;
    }
    
    // Форматируем в часы и минуты
    if (totalMinutes < 60) {
      return `${totalMinutes} мин`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      if (minutes === 0) {
        return `${hours}ч`;
      } else {
        return `${hours}ч ${minutes} мин`;
      }
    }
  };

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [kpId, setKpId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPlayerVisible, setIsPlayerVisible] = useState(false);
  const [renewallIframeUrl, setRenewallIframeUrl] = useState(null);
  const [franchiseDetails, setFranchiseDetails] = useState(null);
  const [isLoadingRenewall, setIsLoadingRenewall] = useState(false);
  const [activeTab, setActiveTab] = useState(null);
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const [loadedPlayers, setLoadedPlayers] = useState({
    renewall: false,
    turbo: false,
    alloha: false,
  });
  const [movieWithBackdrop, setMovieWithBackdrop] = useState(movie);
  const [isBackdropLoading, setIsBackdropLoading] = useState(false);

  const token = "windows_93e27bdd4ca8bfd43c106e8d96f09502_1164344";
  const franchiseToken = "eedefb541aeba871dcfc756e6b31c02e";

  // Максимальное количество символов для краткого описания
  const MAX_DESCRIPTION_LENGTH = 150;

  // Функция для обрезки текста
  const truncateText = (text, maxLength) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Проверяем, нужно ли показывать ссылку "Подробнее"
  const shouldShowMoreLink = (text) => {
    return text && text.length > MAX_DESCRIPTION_LENGTH;
  };

  // Очищаем состояние при закрытии модалки
  useEffect(() => {
    if (!isOpen) {
      setSelectedPlayer(null);
      setKpId(null);
      setIsLoading(false);
      setError(null);
      setIsPlayerVisible(false);
      setRenewallIframeUrl(null);
      setFranchiseDetails(null);
      setIsLoadingRenewall(false);
      setActiveTab(null);
      setIsTabLoading(false);
      setIsDescriptionModalOpen(false);
      setMovieWithBackdrop(movie);
      setIsBackdropLoading(false);
      setLoadedPlayers({
        renewall: false,
        turbo: false,
        alloha: false,
      });
    }
  }, [isOpen, movie]);

  // Загружаем детали франшизы после получения kp_id
  const loadFranchiseDetails = async (movieKpId) => {
    try {
      const details = await VokinoAPI.getFranchiseDetails(
        movieKpId,
        franchiseToken
      );
      setFranchiseDetails(details);
      console.log("Детали франшизы загружены:", details);
    } catch (error) {
      console.error("Ошибка загрузки деталей франшизы:", error);
    }
  };

  // Загружаем детальную информацию фильма с backdrop
  const loadMovieDetails = async () => {
    console.log('=== loadMovieDetails ВЫЗВАНА ===');
    console.log('movie объект:', movie);
    console.log('movie.ident:', movie?.ident);
    console.log('movie.id:', movie?.id);
    
    // Проверяем наличие ident или id для детального API
    const identifier = movie?.ident || movie?.id;
    if (!identifier) {
      console.log('Нет ни ident, ни id, используем исходный movie объект');
      const updatedMovie = {
        ...movie,
        backdrop: movie?.backdrop || movie?.poster
      };
      setMovieWithBackdrop(updatedMovie);
      setIsBackdropLoading(false);
      return;
    }

    try {
      console.log('Вызываем getMovieDetails с identifier:', identifier);
      const details = await VokinoAPI.getMovieDetails(identifier);
      console.log('=== ПОЛНЫЙ ОТВЕТ ОТ getMovieDetails ===');
      console.log('Весь объект details:', JSON.stringify(details, null, 2));
      console.log('details.details:', details?.details);
      console.log('Все поля в details.details:', Object.keys(details?.details || {}));
      console.log('duration поле:', details?.details?.duration);
      console.log('runtime поле:', details?.details?.runtime);
      console.log('length поле:', details?.details?.length);
      console.log('time поле:', details?.details?.time);
      console.log('bg_poster:', details?.details?.bg_poster);
      const rawBackdrop = details?.details?.bg_poster?.backdrop;
      console.log('rawBackdrop:', rawBackdrop);
      
      // Валидируем backdrop URL - проверяем что это корректный URL
      let validBackdrop = null;
      if (rawBackdrop && 
          typeof rawBackdrop === 'string' && 
          rawBackdrop.startsWith('http') && 
          !rawBackdrop.includes('undefined') && 
          !rawBackdrop.includes('null') &&
          !rawBackdrop.includes('httpsnull') &&
          rawBackdrop.length > 10) { // Минимальная длина валидного URL
        validBackdrop = rawBackdrop;
      } else {
        // Пробуем использовать wide_poster как альтернативу
        const wideBackdrop = details?.details?.wide_poster;
        if (wideBackdrop && 
            typeof wideBackdrop === 'string' && 
            wideBackdrop.startsWith('http') && 
            !wideBackdrop.includes('undefined') && 
            !wideBackdrop.includes('null') &&
            !wideBackdrop.includes('httpsnull') &&
            wideBackdrop.length > 10) {
          validBackdrop = wideBackdrop;
        }
      }
      
      console.log('validBackdrop после валидации:', validBackdrop);
      
      // Обновляем фильм с backdrop из детального API или fallback
      const updatedMovie = {
        ...movie,
        backdrop: validBackdrop || movie?.backdrop || movie?.poster,
        duration: details?.details?.duration || details?.details?.runtime || details?.details?.length || details?.details?.time || movie?.duration
      };
      console.log('=== ОБНОВЛЕННЫЙ ОБЪЕКТ ФИЛЬМА ===');
      console.log('updatedMovie.duration:', updatedMovie.duration);
      console.log('Финальный updatedMovie:', updatedMovie);
      setMovieWithBackdrop(updatedMovie);
      setIsBackdropLoading(false);
    } catch (error) {
      console.error("Ошибка загрузки детальной информации фильма:", error);
      // В случае ошибки используем исходный объект с fallback логикой
      const updatedMovie = {
        ...movie,
        backdrop: movie?.backdrop || movie?.poster
      };
      setMovieWithBackdrop(updatedMovie);
      setIsBackdropLoading(false);
    }
  };

  // Автоматически загружаем kp_id и детали франшизы при открытии модалки
  useEffect(() => {
    if (isOpen && movie) {
      const loadMovieData = async () => {
        try {
          // Для фильмов и сериалов не показываем постер сразу, ждем backdrop
          setIsBackdropLoading(true);
          
          // Загружаем детальную информацию фильма с backdrop
          await loadMovieDetails();
          
          // Получаем kp_id если еще не загружен
          if (!kpId) {
            const movieKpId = await fetchKpId();

            // Если kp_id получен, загружаем детали франшизы
            if (movieKpId) {
              await loadFranchiseDetails(movieKpId);
            }
          }
        } catch (error) {
          console.error("Ошибка загрузки данных фильма:", error);
        }
      };

      loadMovieData();
    }
  }, [isOpen, movie]);

  // Автоматически выбираем плеер по умолчанию при открытии модалки
  useEffect(() => {
    if (isOpen && defaultPlayer && !activeTab) {
      // Небольшая задержка чтобы модалка успела открыться
      const timer = setTimeout(() => {
        handleTabChange(defaultPlayer);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultPlayer, activeTab]);

  // Обработчик смены табов плееров
  const handleTabChange = async (playerType) => {
    setActiveTab(playerType);
    setSelectedPlayer(playerType);
    setIsPlayerVisible(false); // Сначала показываем превью
    setIsTabLoading(false);

    // Получаем kp_id если еще не загружен
    let movieKpId = kpId;
    if (!movieKpId) {
      movieKpId = await fetchKpId();
      if (!movieKpId) {
        return;
      }
      // Загружаем детали франшизы если еще не загружены
      if (!franchiseDetails) {
        await loadFranchiseDetails(movieKpId);
      }
    }
  };

  // Обработчик нажатия на кнопку Play в превью
  const handlePlayClick = async (playerType) => {
    // Проверяем, загружен ли уже этот плеер
    if (loadedPlayers[playerType]) {
      // Плеер уже загружен, показываем его сразу
      setIsPlayerVisible(true);
      return;
    }

    setIsTabLoading(true);

    if (playerType === "renewall") {
      await handleRenewall();
    } else if (playerType === "turbo") {
      // Добавляем небольшую задержку для имитации загрузки Turbo плеера
      setTimeout(() => {
        setIsPlayerVisible(true);
        setIsTabLoading(false);
        setLoadedPlayers((prev) => ({ ...prev, turbo: true }));
      }, 800);
      return;
    } else if (playerType === "alloha") {
      // Добавляем небольшую задержку для имитации загрузки Alloha плеера
      setTimeout(() => {
        setIsPlayerVisible(true);
        setIsTabLoading(false);
        setLoadedPlayers((prev) => ({ ...prev, alloha: true }));
      }, 800);
      return;
    }

    setIsTabLoading(false);
  };

  // Функция для получения kp_id
  const fetchKpId = async () => {
    // Проверяем наличие ident сначала, затем id как запасной вариант
    let identifier = null;
    let identifierType = null;
    
    if (movie?.ident && movie.ident !== undefined && movie.ident !== null) {
      identifier = movie.ident;
      identifierType = "ident";
    } else if (movie?.id && movie.id !== undefined && movie.id !== null) {
      identifier = movie.id;
      identifierType = "id";
    }

    if (!identifier) {
      setError("Отсутствует идентификатор фильма");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await VokinoAPI.getMovieKpId(identifier, token);

      if (data.kp_id) {
        setKpId(data.kp_id);
        return data.kp_id;
      } else {
        throw new Error("kp_id не найден в ответе");
      }
    } catch (error) {
      console.error("Ошибка при получении kp_id:", error);
      setError(`Ошибка загрузки: ${error.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Обработчик выбора плеера Renewall
  const handleRenewall = async () => {
    const movieKpId = kpId || (await fetchKpId());

    if (!movieKpId) {
      setIsTabLoading(false);
      return;
    }

    // Проверяем, загружен ли уже Renewall
    if (loadedPlayers.renewall && renewallIframeUrl) {
      setSelectedPlayer("renewall");
      setIsPlayerVisible(true);
      setIsTabLoading(false);
      return;
    }

    // Проверяем, не загружается ли уже Renewall
    if (isLoadingRenewall) {
      return;
    }

    setIsLoadingRenewall(true);
    try {
      // Получаем данные от Renewall API для iframe_url
      const renewallData = await VokinoAPI.getRenewall(movieKpId);
      console.log("Renewall API response:", renewallData);

      if (renewallData.iframe_url) {
        setRenewallIframeUrl(renewallData.iframe_url);
        // Не перезаписываем franchiseDetails, если они уже загружены
        if (!franchiseDetails) {
          setFranchiseDetails(renewallData);
          console.log("Franchise details set from Renewall:", renewallData);
        }
        setSelectedPlayer("renewall");
        setIsPlayerVisible(true);
        setLoadedPlayers((prev) => ({ ...prev, renewall: true }));
      } else {
        throw new Error("iframe_url не найден в ответе Renewall");
      }
    } catch (error) {
      console.error("Ошибка при получении Renewall плеера:", error);
      setError(`Ошибка Renewall плеера: ${error.message}`);
    } finally {
      setIsLoadingRenewall(false);
      setIsTabLoading(false);
    }
  };

  // Обработчик выбора плеера Turbo
  const handleTurbo = async () => {
    const movieKpId = kpId || (await fetchKpId());

    if (!movieKpId) {
      return;
    }

    setSelectedPlayer("turbo");
    setIsPlayerVisible(true);
  };

  // Сброс состояния при закрытии модалки
  const handleClose = (open) => {
    console.log("handleClose вызван, open:", open);

    // Если open === false, значит модалка закрывается
    if (open === false) {
      setSelectedPlayer(null);
      setKpId(null);
      setIsLoading(false);
      setError(null);
      setIsPlayerVisible(false);
      setRenewallIframeUrl(null);
      setIsTabLoading(false);
      setIsDescriptionModalOpen(false);
      setLoadedPlayers({
        renewall: false,
        turbo: false,
        alloha: false,
      });
      onClose();
    }
  };

  // Функция для принудительного закрытия модалки
  const forceClose = () => {
    console.log("forceClose вызван - закрываем все модальное окно полностью");
    // Сначала вызываем onClose чтобы закрыть модалку
    onClose();
    // Затем очищаем состояние (это произойдет в useEffect при isOpen === false)
  };

  // Обработчик добавления/удаления из избранного
  const handleFavoriteToggle = (e) => {
    e.stopPropagation();
    
    if (!movieWithBackdrop) return;
    
    if (isFavorite(movieWithBackdrop.id)) {
      removeFromFavorites(movieWithBackdrop.id);
    } else {
      // Передаем null как sourceElement, так как анимация не нужна в модальном окне
      addToFavorites(movieWithBackdrop, null);
    }
  };

  // Компонент превью плеера с backdrop и кнопкой Play
  const PlayerPreview = ({ playerType, onPlay }) => {
    // Если backdrop загружается, показываем лоадер вместо постера
    if (isBackdropLoading) {
      return (
        <div 
          className="relative w-full flex items-center justify-center bg-muted/20 rounded-lg"
          style={{ aspectRatio: "16/9" }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      );
    }
    
    const backdropUrl = movieWithBackdrop?.backdrop || movieWithBackdrop?.poster || "https://kinohost.web.app/no_poster.png";
    console.log('PlayerPreview - backdropUrl:', backdropUrl);
    
    return (
      <div 
        className="relative w-full cursor-pointer group overflow-hidden rounded-lg"
        style={{ aspectRatio: "16/9" }}
        onClick={onPlay}
      >
        {/* Backdrop изображение */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${backdropUrl})`,
            filter: 'brightness(0.7)'
          }}
        />
        
        {/* Градиент оверлей */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        
        {/* Кнопка Play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 transition-all duration-300 group-hover:scale-110">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>
        
        {/* Информация о фильме */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex flex-col items-start">
            <h3 className="text-white font-semibold text-lg">{movieWithBackdrop?.title}</h3>
            {movieWithBackdrop?.duration && (
              <p className="text-white/80 text-sm">{formatDuration(movieWithBackdrop.duration)}</p>
            )}
          </div>
        </div>
        
        {/* Hover эффект */}
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-300" />
      </div>
    );
  };

  // Рендер iframe плеера
  const renderPlayer = () => {
    if (!isPlayerVisible || !kpId) {
      return null;
    }

    let playerUrl = null;
    let playerTitle = "Плеер";

    if (selectedPlayer === "turbo") {
      playerUrl = VokinoAPI.getTurboPlayerUrl(kpId);
      playerTitle = "Turbo Плеер";
    } else if (selectedPlayer === "renewall" && renewallIframeUrl) {
      playerUrl = renewallIframeUrl;
      playerTitle = "Renewall Плеер";
    } else if (selectedPlayer === "alloha") {
      // URL для Alloha плеера с параметрами season=1 и episode=1
      playerUrl = `https://looking.as.newplayjj.com:9443/?kp=${kpId}&token=5af6e7af5ffb19f2ddb300d28d90f8&season=1&episode=1`;
      playerTitle = "Alloha Плеер";
    }

    if (!playerUrl) {
      return null;
    }

    return (
      <div className="relative w-full" style={{ aspectRatio: "16/9" }}>
        <iframe
          src={playerUrl}
          frameBorder="0"
          allowFullScreen
          className="w-full h-full rounded-lg"
          title={`${playerTitle} - Просмотр ${movie?.title || "фильма"}`}
        />
        {/* Убрали кнопку закрытия из iframe - закрытие только через основной крестик модалки */}
      </div>
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent
        className="player-modal max-w-6xl max-h-[90vh] overflow-y-auto border-2 border-gray-300/40"
        style={{
          background: "#202020",
          boxShadow: "inset 0px 11px 20px 5px black",
        }}
        onPointerDownOutside={(e) => {
          console.log("Клик вне модалки");
          e.preventDefault();
          forceClose();
        }}
        onEscapeKeyDown={(e) => {
          console.log("Нажатие Escape");
          e.preventDefault();
          forceClose();
        }}
      >
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              <TextShimmer duration={3} spread={1.5}>
                {movieWithBackdrop?.title || "Выбор плеера"}
              </TextShimmer>
            </AlertDialogTitle>
            <div className="flex items-center gap-2">
              {/* Кнопка добавления в избранное */}
              <Button
                onClick={handleFavoriteToggle}
                variant="ghost"
                size="sm"
                className={`h-6 w-6 p-0 transition-colors ${
                  isFavorite(movieWithBackdrop?.id) || isInFavoritesOrPending(movieWithBackdrop?.id)
                    ? "text-red-500 hover:text-red-600 hover:bg-red-500/10"
                    : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                }`}
                title={isFavorite(movieWithBackdrop?.id) ? "Удалить из избранного" : "Добавить в избранное"}
              >
                <Heart 
                  className={`w-4 h-4 transition-all ${
                    isFavorite(movieWithBackdrop?.id) || isInFavoritesOrPending(movieWithBackdrop?.id)
                      ? "fill-current"
                      : ""
                  }`} 
                />
                <span className="sr-only">
                  {isFavorite(movieWithBackdrop?.id) ? "Удалить из избранного" : "Добавить в избранное"}
                </span>
              </Button>
              {/* Кнопка закрытия */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  forceClose();
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-destructive/10"
                title="Закрыть модальное окно полностью"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Закрыть модальное окно полностью</span>
              </Button>
            </div>
          </div>
          <AlertDialogDescription>
            Выберите плеер для просмотра{" "}
            {movieWithBackdrop?.title ? `"${movieWithBackdrop.title}"` : "фильма"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Отображение ошибки */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Информация о фильме */}
        {movieWithBackdrop && (
          <div
            className="flex gap-4 p-4 bg-muted/50 rounded-lg"
            style={{
              background:
                "linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))",
              boxShadow:
                "rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset",
              borderTop: "1px solid rgb(84, 84, 84)",
            }}
          >
            <img
              src={movieWithBackdrop.poster || "https://kinohost.web.app/no_poster.png"}
              alt={movieWithBackdrop.title}
              className="w-20 h-30 md:w-24 md:h-36 object-cover rounded"
            />
            <div className="flex-1">
              {movieWithBackdrop.description ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {truncateText(movieWithBackdrop.description, MAX_DESCRIPTION_LENGTH)}
                  </p>
                  {shouldShowMoreLink(movieWithBackdrop.description) && (
                    <Link
                      onClick={() => setIsDescriptionModalOpen(true)}
                      className="text-sm text-white hover:text-gray-300"
                    >
                      Подробнее
                    </Link>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Описания нет
                </p>
              )}
            </div>
          </div>
        )}

        {/* Плеер или выбор плеера */}
        <div className="space-y-4">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-muted-foreground">Выберите плеер:</h3>
              <TabsList className="w-fit">
                <TabsTrigger
                  value="renewall"
                  className="flex items-center gap-2"
                >
                  Renewall
                  {activeTab === "renewall" &&
                  isTabLoading &&
                  !loadedPlayers.renewall ? (
                    <Loader2 className="w-3 h-3 animate-spin ml-2" />
                  ) : franchiseDetails?.quality ? (
                    <span className="text-xs bg-black text-white px-2 py-1 rounded ml-2">
                      {franchiseDetails.quality}
                    </span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger value="turbo" className="flex items-center gap-2">
                  Turbo
                </TabsTrigger>
                <TabsTrigger value="alloha" className="flex items-center gap-2">
                  Alloha
                </TabsTrigger>
              </TabsList>
            </div>

            {!activeTab && (
              <div
                className="flex items-center justify-center p-8"
                style={{ aspectRatio: "16/9" }}
              >
              </div>
            )}

            {activeTab === "renewall" && (
              <TabsContent value="renewall" className="mt-0">
                {isTabLoading ? (
                  <div
                    className="flex items-center justify-center p-8"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isPlayerVisible && selectedPlayer === "renewall" ? (
                  renderPlayer()
                ) : (
                  <PlayerPreview 
                    playerType="renewall" 
                    onPlay={() => handlePlayClick("renewall")} 
                  />
                )}
              </TabsContent>
            )}

            {activeTab === "turbo" && (
              <TabsContent value="turbo" className="mt-0">
                {isTabLoading ? (
                  <div
                    className="flex items-center justify-center p-8"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isPlayerVisible && selectedPlayer === "turbo" ? (
                  renderPlayer()
                ) : (
                  <PlayerPreview 
                    playerType="turbo" 
                    onPlay={() => handlePlayClick("turbo")} 
                  />
                )}
              </TabsContent>
            )}

            {activeTab === "alloha" && (
              <TabsContent value="alloha" className="mt-0">
                {isTabLoading ? (
                  <div
                    className="flex items-center justify-center p-8"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isPlayerVisible && selectedPlayer === "alloha" ? (
                  renderPlayer()
                ) : (
                  <PlayerPreview 
                    playerType="alloha" 
                    onPlay={() => handlePlayClick("alloha")} 
                  />
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </AlertDialogContent>

      {/* Модалка с полным описанием */}
      <FullDescriptionModal
        movie={movieWithBackdrop}
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
      />
    </AlertDialog>
  );
};

export default PlayerModal;

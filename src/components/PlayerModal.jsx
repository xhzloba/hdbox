"use client";

import { useState, useEffect, useContext } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Button } from "../../components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui/tabs";
import { Play, X, Loader2 } from "lucide-react";
import VokinoAPI from "../services/api";
import FullDescriptionModal from "./FullDescriptionModal";
import { Link } from "../../components/ui/link";
import SettingsContext from "../contexts/SettingsContext";

const PlayerModal = ({ movie, isOpen, onClose }) => {
  const settingsContext = useContext(SettingsContext);
  const defaultPlayer = settingsContext?.defaultPlayer || 'renewall';
  
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
    alloha: false
  });

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
      console.log("Модалка закрыта, очищаем состояние");
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
      setLoadedPlayers({
        renewall: false,
        turbo: false,
        alloha: false
      });
    }
  }, [isOpen]);

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

  // Автоматически загружаем kp_id и детали франшизы при открытии модалки
  useEffect(() => {
    if (isOpen && movie && !kpId) {
      const loadMovieData = async () => {
        try {
          // Сначала получаем kp_id
          const movieKpId = await fetchKpId();

          // Если kp_id получен, загружаем детали франшизы
          if (movieKpId) {
            await loadFranchiseDetails(movieKpId);
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
    
    // Проверяем, загружен ли уже этот плеер
    if (loadedPlayers[playerType]) {
      // Плеер уже загружен, показываем его сразу без лоадера
      setSelectedPlayer(playerType);
      setIsPlayerVisible(true);
      setIsTabLoading(false);
      return;
    }

    setIsTabLoading(true);
    setIsPlayerVisible(false); // Скрываем предыдущий плеер

    // Получаем kp_id только при первом выборе плеера, если еще не загружен
    let movieKpId = kpId;
    if (!movieKpId) {
      movieKpId = await fetchKpId();
      if (!movieKpId) {
        setIsTabLoading(false);
        return;
      }
      // Загружаем детали франшизы если еще не загружены
      if (!franchiseDetails) {
        await loadFranchiseDetails(movieKpId);
      }
    }

    if (playerType === "renewall") {
      await handleRenewall();
    } else if (playerType === "turbo") {
      // Добавляем небольшую задержку для имитации загрузки Turbo плеера
      setTimeout(() => {
        setSelectedPlayer("turbo");
        setIsPlayerVisible(true);
        setIsTabLoading(false);
        setLoadedPlayers(prev => ({ ...prev, turbo: true }));
      }, 800);
      return;
    } else if (playerType === "alloha") {
      // Добавляем небольшую задержку для имитации загрузки Alloha плеера
      setTimeout(() => {
        setSelectedPlayer("alloha");
        setIsPlayerVisible(true);
        setIsTabLoading(false);
        setLoadedPlayers(prev => ({ ...prev, alloha: true }));
      }, 800);
      return;
    }

    setIsTabLoading(false);
  };

  // Функция для получения kp_id
  const fetchKpId = async () => {
    // Отладочная информация о фильме
    console.log("Объект фильма:", movie);
    console.log("Доступные ключи:", movie ? Object.keys(movie) : "нет объекта");

    // Проверяем наличие ident или используем id как запасной вариант
    const identifier = movie?.ident || movie?.id;

    if (!identifier) {
      setError("Отсутствует идентификатор фильма");
      return null;
    }

    console.log("Используемый идентификатор:", identifier);

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
        setLoadedPlayers(prev => ({ ...prev, renewall: true }));
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
        alloha: false
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
        className="player-modal max-w-6xl max-h-[90vh] overflow-y-auto"
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
              {movie?.title || "Выбор плеера"}
            </AlertDialogTitle>
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
          <AlertDialogDescription>
            Выберите плеер для просмотра{" "}
            {movie?.title ? `"${movie.title}"` : "фильма"}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Отображение ошибки */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        )}

        {/* Информация о фильме */}
        {movie && (
          <div 
            className="flex gap-4 p-4 bg-muted/50 rounded-lg"
            style={{
              background: 'linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))',
              boxShadow: 'rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset',
              borderTop: '1px solid rgb(84, 84, 84)'
            }}
          >
            <img
              src={movie.poster || "https://kinohost.web.app/no_poster.png"}
              alt={movie.title}
              className="w-20 h-30 md:w-24 md:h-36 object-cover rounded"
            />
            <div className="flex-1">
              {movie.description ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {truncateText(movie.description, MAX_DESCRIPTION_LENGTH)}
                  </p>
                  {shouldShowMoreLink(movie.description) && (
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
                  {activeTab === "renewall" && isTabLoading && !loadedPlayers.renewall ? (
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
                className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg"
                style={{ aspectRatio: "16/9" }}
              >
                <div className="text-center space-y-2">
                  <Play className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-muted-foreground">
                    Выберите плеер для просмотра
                  </p>
                </div>
              </div>
            )}

            {activeTab === "renewall" && (
              <TabsContent value="renewall" className="mt-0">
                {isTabLoading ? (
                  <div
                    className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isPlayerVisible && selectedPlayer === "renewall" ? (
                  renderPlayer()
                ) : (
                  <div
                    className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                  >
                    {isLoading || isLoadingRenewall ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-muted-foreground">
                          Получение данных...
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                          Нажмите на таб Renewall для загрузки плеера
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            )}

            {activeTab === "turbo" && (
              <TabsContent value="turbo" className="mt-0">
                {isTabLoading ? (
                  <div
                    className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isPlayerVisible && selectedPlayer === "turbo" ? (
                  renderPlayer()
                ) : (
                  <div
                    className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                  >
                    {isLoading && activeTab === "turbo" ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-muted-foreground">
                          Получение данных...
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                          Нажмите на таб Turbo для загрузки плеера
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            )}

            {activeTab === "alloha" && (
              <TabsContent value="alloha" className="mt-0">
                {isTabLoading ? (
                  <div
                    className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  </div>
                ) : isPlayerVisible && selectedPlayer === "alloha" ? (
                  renderPlayer()
                ) : (
                  <div
                    className="flex items-center justify-center p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg"
                    style={{ aspectRatio: "16/9" }}
                  >
                    {isLoading && activeTab === "alloha" ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-muted-foreground">
                          Получение данных...
                        </span>
                      </div>
                    ) : (
                      <div className="text-center space-y-2">
                        <p className="text-muted-foreground">
                          Нажмите на таб Alloha для загрузки плеера
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
      </AlertDialogContent>

      {/* Модалка с полным описанием */}
      <FullDescriptionModal
        movie={movie}
        isOpen={isDescriptionModalOpen}
        onClose={() => setIsDescriptionModalOpen(false)}
      />
    </AlertDialog>
  );
};

export default PlayerModal;

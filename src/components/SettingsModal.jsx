"use client";

import React, { useContext, useState, useEffect } from "react";
import { Settings } from "lucide-react";
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
import SettingsContext from "../contexts/SettingsContext";

const SettingsModal = ({ isOpen, onClose }) => {
  const settingsContext = useContext(SettingsContext);

  // Если контекст не доступен, не рендерим диалог
  if (!settingsContext) {
    return null;
  }

  const {
    showDetails,
    toggleShowDetails,
    showRatingAsIcons,
    toggleShowRatingAsIcons,
    showFavoriteButton,
    toggleShowFavoriteButton,
    cardShadowsEnabled,
    toggleCardShadows,
    coloredHoverEnabled,
    toggleColoredHover,
    pageStylesEnabled,
    togglePageStyles,
    showTags,
    toggleShowTags,
    backdropEnabled,
    toggleBackdrop,
    defaultPlayer,
    setDefaultPlayer,
  } = settingsContext;
  // Временное состояние для настроек до подтверждения
  const [tempShowDetails, setTempShowDetails] = useState(showDetails);
  const [tempShowRatingAsIcons, setTempShowRatingAsIcons] =
    useState(showRatingAsIcons);
  const [tempShowFavoriteButton, setTempShowFavoriteButton] =
    useState(showFavoriteButton);
  const [tempCardShadowsEnabled, setTempCardShadowsEnabled] =
    useState(cardShadowsEnabled);
  const [tempColoredHoverEnabled, setTempColoredHoverEnabled] =
    useState(coloredHoverEnabled);
  const [tempPageStylesEnabled, setTempPageStylesEnabled] =
    useState(pageStylesEnabled);
  const [tempShowTags, setTempShowTags] = useState(showTags);
  const [tempBackdropEnabled, setTempBackdropEnabled] =
    useState(backdropEnabled);
  const [tempDefaultPlayer, setTempDefaultPlayer] = useState(defaultPlayer);
  const [activeTab, setActiveTab] = useState("display");

  // Синхронизируем временное состояние с основным при открытии
  useEffect(() => {
    if (isOpen) {
      setTempShowDetails(showDetails);
      setTempShowRatingAsIcons(showRatingAsIcons);
      setTempShowFavoriteButton(showFavoriteButton);
      setTempCardShadowsEnabled(cardShadowsEnabled);
      setTempColoredHoverEnabled(coloredHoverEnabled);
      setTempPageStylesEnabled(pageStylesEnabled);
      setTempShowTags(showTags);
      setTempBackdropEnabled(backdropEnabled);
      setTempDefaultPlayer(defaultPlayer);
    }
  }, [
    isOpen,
    showDetails,
    showRatingAsIcons,
    showFavoriteButton,
    cardShadowsEnabled,
    coloredHoverEnabled,
    pageStylesEnabled,
    showTags,
    backdropEnabled,
    defaultPlayer,
  ]);

  const handleConfirm = () => {
    // Применяем изменения только при подтверждении
    if (tempShowDetails !== showDetails) {
      toggleShowDetails();
    }
    if (tempShowRatingAsIcons !== showRatingAsIcons) {
      toggleShowRatingAsIcons();
    }
    if (tempShowFavoriteButton !== showFavoriteButton) {
      toggleShowFavoriteButton();
    }
    if (tempCardShadowsEnabled !== cardShadowsEnabled) {
      toggleCardShadows();
    }
    if (tempColoredHoverEnabled !== coloredHoverEnabled) {
      toggleColoredHover();
    }
    if (tempPageStylesEnabled !== pageStylesEnabled) {
      togglePageStyles();
    }
    if (tempShowTags !== showTags) {
      toggleShowTags();
    }
    if (tempBackdropEnabled !== backdropEnabled) {
      toggleBackdrop();
    }
    if (tempDefaultPlayer !== defaultPlayer) {
      setDefaultPlayer(tempDefaultPlayer);
    }
    onClose();
  };

  const handleCancel = () => {
    // Сбрасываем временные изменения
    setTempShowDetails(showDetails);
    setTempShowRatingAsIcons(showRatingAsIcons);
    setTempShowFavoriteButton(showFavoriteButton);
    setTempCardShadowsEnabled(cardShadowsEnabled);
    setTempColoredHoverEnabled(coloredHoverEnabled);
    setTempPageStylesEnabled(pageStylesEnabled);
    setTempShowTags(showTags);
    setTempBackdropEnabled(backdropEnabled);
    setTempDefaultPlayer(defaultPlayer);
    onClose();
  };

  const handleToggleTemp = () => {
    setTempShowDetails(!tempShowDetails);
  };

  const handleToggleRatingTemp = () => {
    setTempShowRatingAsIcons(!tempShowRatingAsIcons);
  };

  const handleToggleFavoriteButtonTemp = () => {
    setTempShowFavoriteButton(!tempShowFavoriteButton);
  };

  const handleToggleCardShadowsTemp = () => {
    setTempCardShadowsEnabled(!tempCardShadowsEnabled);
  };

  const handleToggleColoredHoverTemp = () => {
    setTempColoredHoverEnabled(!tempColoredHoverEnabled);
  };

  const handleTogglePageStylesTemp = () => {
    setTempPageStylesEnabled(!tempPageStylesEnabled);
  };

  const handleToggleShowTagsTemp = () => {
    setTempShowTags(!tempShowTags);
  };

  const handleToggleBackdropTemp = () => {
    setTempBackdropEnabled(!tempBackdropEnabled);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Настройки
          </AlertDialogTitle>
          <AlertDialogDescription>
            Настройте отображение карточек фильмов и сериалов
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Settings Content with Tabs */}
        <div className="w-full">
          {/* Custom Tabs with Main Page Style */}
          <div className="mb-6">
            <div
              className="bg-muted text-muted-foreground inline-flex w-fit items-center justify-center rounded-lg p-1 gap-1"
              style={{
                background: "linear-gradient(131deg, #191919, #242323)",
                boxShadow: "7px 5px 8px #000000, inset 2px 2px 20px #303132",
              }}
            >
              <button
                onClick={() => setActiveTab("display")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  activeTab === "display"
                    ? "bg-background text-foreground ring-2 ring-ring ring-offset-2"
                    : "hover:bg-background/50 hover:text-foreground"
                }`}
              >
                Карточки
              </button>
              <button
                onClick={() => setActiveTab("player")}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                  activeTab === "player"
                    ? "bg-background text-foreground ring-2 ring-ring ring-offset-2"
                    : "hover:bg-background/50 hover:text-foreground"
                }`}
              >
                Плеер
              </button>
            </div>
          </div>

          {/* Display Tab Content */}
          {activeTab === "display" && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-4">Отображение карточек</h3>

              {/* Show Details Toggle */}
              <div
                onClick={handleToggleTemp}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  tempShowDetails
                    ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-1 ${
                      tempShowDetails ? "text-sidebar-primary-foreground" : ""
                    }`}
                  >
                    Показывать детали
                  </label>
                  <p
                    className={`text-xs ${
                      tempShowDetails
                        ? "text-sidebar-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    Название, год, жанр и кнопка избранного
                  </p>
                </div>

                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                    tempShowDetails
                      ? "bg-sidebar-primary"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                      tempShowDetails
                        ? "translate-x-6 bg-sidebar-primary-foreground"
                        : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>

              {/* Show Rating as Icons Toggle */}
              <div
                onClick={handleToggleRatingTemp}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer mt-3 ${
                  tempShowRatingAsIcons
                    ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-1 ${
                      tempShowRatingAsIcons
                        ? "text-sidebar-primary-foreground"
                        : ""
                    }`}
                  >
                    Рейтинг иконками
                  </label>
                  <p
                    className={`text-xs ${
                      tempShowRatingAsIcons
                        ? "text-sidebar-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    Отображать рейтинг иконками
                  </p>
                </div>

                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                    tempShowRatingAsIcons
                      ? "bg-sidebar-primary"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                      tempShowRatingAsIcons
                        ? "translate-x-6 bg-sidebar-primary-foreground"
                        : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>

              {/* Show Favorite Button Toggle */}
              <div
                onClick={handleToggleFavoriteButtonTemp}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer mt-3 ${
                  tempShowFavoriteButton
                    ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-1 ${
                      tempShowFavoriteButton
                        ? "text-sidebar-primary-foreground"
                        : ""
                    }`}
                  >
                    Показывать кнопку избранного
                  </label>
                  <p
                    className={`text-xs ${
                      tempShowFavoriteButton
                        ? "text-sidebar-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    Всегда видимая или только при наведении
                  </p>
                </div>

                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                    tempShowFavoriteButton
                      ? "bg-sidebar-primary"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                      tempShowFavoriteButton
                        ? "translate-x-6 bg-sidebar-primary-foreground"
                        : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>

              {/* Card Shadows Toggle */}
              <div
                onClick={handleToggleCardShadowsTemp}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer mt-3 ${
                  tempCardShadowsEnabled
                    ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-1 ${
                      tempCardShadowsEnabled
                        ? "text-sidebar-primary-foreground"
                        : ""
                    }`}
                  >
                    Тени карточек
                  </label>
                  <p
                    className={`text-xs ${
                      tempCardShadowsEnabled
                        ? "text-sidebar-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    Отображать тени у карточек фильмов
                  </p>
                </div>

                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                    tempCardShadowsEnabled
                      ? "bg-sidebar-primary"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                      tempCardShadowsEnabled
                        ? "translate-x-6 bg-sidebar-primary-foreground"
                        : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>

              {/* Colored Hover Toggle */}
              <div
                onClick={handleToggleColoredHoverTemp}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer mt-3 ${
                  tempColoredHoverEnabled
                    ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-1 ${
                      tempColoredHoverEnabled
                        ? "text-sidebar-primary-foreground"
                        : ""
                    }`}
                  >
                    Цветное затемнение
                  </label>
                  <p
                    className={`text-xs ${
                      tempColoredHoverEnabled
                        ? "text-sidebar-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    Цвет наведения зависит от рейтинга
                  </p>
                </div>

                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                    tempColoredHoverEnabled
                      ? "bg-sidebar-primary"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                      tempColoredHoverEnabled
                        ? "translate-x-6 bg-sidebar-primary-foreground"
                        : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>

              {/* Page Styles Toggle */}
              <div
                onClick={handleTogglePageStylesTemp}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer mt-3 ${
                  tempPageStylesEnabled
                    ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-1 ${
                      tempPageStylesEnabled
                        ? "text-sidebar-primary-foreground"
                        : ""
                    }`}
                  >
                    Стили страниц
                  </label>
                  <p
                    className={`text-xs ${
                      tempPageStylesEnabled
                        ? "text-sidebar-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    Закругленные углы и тени для страниц
                  </p>
                </div>

                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                    tempPageStylesEnabled
                      ? "bg-sidebar-primary"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                      tempPageStylesEnabled
                        ? "translate-x-6 bg-sidebar-primary-foreground"
                        : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>

              {/* Show Tags Toggle */}
              <div
                onClick={handleToggleShowTagsTemp}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer mt-3 ${
                  tempShowTags
                    ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-1 ${
                      tempShowTags ? "text-sidebar-primary-foreground" : ""
                    }`}
                  >
                    Показывать теги качества
                  </label>
                  <p
                    className={`text-xs ${
                      tempShowTags
                        ? "text-sidebar-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    HD, 4K и другие теги качества на карточках
                  </p>
                </div>

                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                    tempShowTags
                      ? "bg-sidebar-primary"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                      tempShowTags
                        ? "translate-x-6 bg-sidebar-primary-foreground"
                        : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>

              {/* Backdrop Background Toggle */}
              <div
                onClick={handleToggleBackdropTemp}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer mt-3 ${
                  tempBackdropEnabled
                    ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                    : "bg-muted/30"
                }`}
              >
                <div className="flex flex-col">
                  <label
                    className={`text-sm font-medium mb-1 ${
                      tempBackdropEnabled
                        ? "text-sidebar-primary-foreground"
                        : ""
                    }`}
                  >
                    Backdrop фон плеера
                  </label>
                  <p
                    className={`text-xs ${
                      tempBackdropEnabled
                        ? "text-sidebar-primary-foreground/80"
                        : "text-muted-foreground"
                    }`}
                  >
                    Показывать backdrop фон под модальным окном плеера
                  </p>
                </div>

                <button
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                    tempBackdropEnabled
                      ? "bg-sidebar-primary"
                      : "bg-muted-foreground/30"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                      tempBackdropEnabled
                        ? "translate-x-6 bg-sidebar-primary-foreground"
                        : "translate-x-1 bg-white"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Player Tab Content */}
          {activeTab === "player" && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium mb-4">Плеер по умолчанию</h3>

              <div className="space-y-3">
                {/* Renewall Option */}
                <div
                  onClick={() => setTempDefaultPlayer("renewall")}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    tempDefaultPlayer === "renewall"
                      ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        tempDefaultPlayer === "renewall"
                          ? "border-sidebar-primary-foreground"
                          : "border-muted-foreground"
                      }`}
                    >
                      {tempDefaultPlayer === "renewall" && (
                        <div className="w-2 h-2 rounded-full bg-sidebar-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          tempDefaultPlayer === "renewall"
                            ? "text-sidebar-primary-foreground"
                            : ""
                        }`}
                      >
                        Плеер 1
                      </label>
                      <p
                        className={`text-xs ${
                          tempDefaultPlayer === "renewall"
                            ? "text-sidebar-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        Высокое качество, стабильная работа
                      </p>
                    </div>
                  </div>
                </div>

                {/* Turbo Option */}
                <div
                  onClick={() => setTempDefaultPlayer("turbo")}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    tempDefaultPlayer === "turbo"
                      ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        tempDefaultPlayer === "turbo"
                          ? "border-sidebar-primary-foreground"
                          : "border-muted-foreground"
                      }`}
                    >
                      {tempDefaultPlayer === "turbo" && (
                        <div className="w-2 h-2 rounded-full bg-sidebar-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          tempDefaultPlayer === "turbo"
                            ? "text-sidebar-primary-foreground"
                            : ""
                        }`}
                      >
                        Плеер 2
                      </label>
                      <p
                        className={`text-xs ${
                          tempDefaultPlayer === "turbo"
                            ? "text-sidebar-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        Быстрая загрузка, хорошее качество
                      </p>
                    </div>
                  </div>
                </div>

                {/* Alloha Option */}
                <div
                  onClick={() => setTempDefaultPlayer("alloha")}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    tempDefaultPlayer === "alloha"
                      ? "bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground"
                      : "bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        tempDefaultPlayer === "alloha"
                          ? "border-sidebar-primary-foreground"
                          : "border-muted-foreground"
                      }`}
                    >
                      {tempDefaultPlayer === "alloha" && (
                        <div className="w-2 h-2 rounded-full bg-sidebar-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <label
                        className={`text-sm font-medium ${
                          tempDefaultPlayer === "alloha"
                            ? "text-sidebar-primary-foreground"
                            : ""
                        }`}
                      >
                        Плеер 3
                      </label>
                      <p
                        className={`text-xs ${
                          tempDefaultPlayer === "alloha"
                            ? "text-sidebar-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        Альтернативный плеер, множественные источники
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Подтвердить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SettingsModal;

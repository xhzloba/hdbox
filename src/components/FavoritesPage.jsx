"use client";

import React, { useState, useEffect } from "react";
import { useFavorites } from "../contexts/FavoritesContext";
import { useSettings } from "../contexts/SettingsContext";
import MovieCard from "../components/MovieCard";
import DraggableTab from "../components/DraggableTab";
import {
  Heart,
  Trash2,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";

const FavoritesPage = () => {
  const { favorites, removeFromFavorites, clearFavorites, getFavoritesCount } =
    useFavorites();
  const { pageStylesEnabled } = useSettings();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const [isTabsLocked, setIsTabsLocked] = useState(true);
  const [tabsOrder, setTabsOrder] = useState([]);
  const [isTabsCollapsed, setIsTabsCollapsed] = useState(false);

  // Sensors для drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleRemoveFromFavorites = (movieId, e) => {
    e.stopPropagation();
    setMovieToDelete(movieId);
    setShowDeleteDialog(true);
  };

  const confirmRemoveFromFavorites = () => {
    if (movieToDelete) {
      removeFromFavorites(movieToDelete);
      setMovieToDelete(null);
    }
    setShowDeleteDialog(false);
  };

  const handleClearAll = () => {
    clearFavorites();
    setShowClearDialog(false);
  };

  // Получение уникальных стран из избранных элементов
  const getUniqueCountries = () => {
    const countries = favorites
      .map((item) => item.country)
      .filter((country) => country && country.trim() !== "")
      .map((country) => {
        // Обрабатываем случаи когда страна может быть строкой с несколькими странами
        if (typeof country === "string" && country.includes(",")) {
          return country.split(",").map((c) => c.trim());
        }
        return country;
      })
      .flat()
      .filter((country) => country && country.trim() !== "");

    return [...new Set(countries)].sort();
  };

  // Получение уникальных жанров из всех жанров избранных элементов
  const getUniqueGenres = () => {
    const genres = favorites
      .map((item) => item.genre)
      .filter((genre) => genre)
      .map((genre) => {
        // Обрабатываем случаи когда жанр может быть массивом или строкой
        if (Array.isArray(genre)) {
          return genre;
        } else if (typeof genre === "string" && genre.includes(",")) {
          return genre.split(",").map((g) => g.trim());
        }
        return [genre];
      })
      .flat()
      .filter((genre) => genre && genre.trim() !== "")
      .map((genre) => genre.trim());

    return [...new Set(genres)].sort();
  };

  // Фильтрация контента по типу и стране
  const getFilteredFavorites = () => {
    let filtered = [];

    switch (activeTab) {
      case "movies":
        filtered = favorites.filter((item) => item.type === "movie");
        break;
      case "series":
        filtered = favorites.filter(
          (item) => item.type === "tv" || item.type === "serial"
        );
        break;
      case "cartoons":
        filtered = favorites.filter((item) => item.type === "multfilm");
        break;
      case "cartoon-series":
        filtered = favorites.filter(
          (item) =>
            item.type === "multfilm" &&
            item.genre &&
            (Array.isArray(item.genre)
              ? item.genre.some((g) => g.includes("сериал"))
              : item.genre.includes("сериал"))
        );
        break;
      case "countries":
        if (selectedCountry) {
          filtered = favorites.filter((item) => {
            if (!item.country) return false;
            // Проверяем точное совпадение или вхождение в список стран через запятую
            if (typeof item.country === "string") {
              return (
                item.country === selectedCountry ||
                item.country
                  .split(",")
                  .map((c) => c.trim())
                  .includes(selectedCountry)
              );
            }
            return item.country === selectedCountry;
          });
        } else {
          filtered = favorites;
        }
        break;
      case "genres":
        if (selectedGenre) {
          filtered = favorites.filter((item) => {
            if (!item.genre) return false;
            // Проверяем вхождение жанра в массив или строку жанров
            if (Array.isArray(item.genre)) {
              return item.genre.includes(selectedGenre);
            } else if (typeof item.genre === "string") {
              if (item.genre.includes(",")) {
                return item.genre
                  .split(",")
                  .map((g) => g.trim())
                  .includes(selectedGenre);
              }
              return item.genre.trim() === selectedGenre;
            }
            return false;
          });
        } else {
          filtered = favorites;
        }
        break;
      case "all":
      default:
        filtered = favorites;
        break;
    }

    return filtered;
  };

  const filteredFavorites = getFilteredFavorites();

  // Базовые табы
  const baseTabs = [
    { id: "all", label: "Все", count: favorites.length },
    {
      id: "movies",
      label: "Фильмы",
      count: favorites.filter((item) => item.type === "movie").length,
    },
    {
      id: "series",
      label: "Сериалы",
      count: favorites.filter(
        (item) => item.type === "tv" || item.type === "serial"
      ).length,
    },
    {
      id: "cartoons",
      label: "Мультфильмы",
      count: favorites.filter((item) => item.type === "multfilm").length,
    },
    {
      id: "cartoon-series",
      label: "Мультсериалы",
      count: favorites.filter(
        (item) =>
          item.type === "multfilm" &&
          item.genre &&
          (Array.isArray(item.genre)
            ? item.genre.some((g) => g.includes("сериал"))
            : item.genre.includes("сериал"))
      ).length,
    },
    {
      id: "countries",
      label: "По странам",
      count: getUniqueCountries().length,
    },
    { id: "genres", label: "По жанрам", count: getUniqueGenres().length },
  ];

  // Инициализация порядка табов (исключаем 'all')
  useEffect(() => {
    const savedOrder = localStorage.getItem("favoritesTabsOrder");
    if (savedOrder) {
      try {
        const parsedOrder = JSON.parse(savedOrder);
        // Фильтруем 'all' из сохраненного порядка
        const filteredOrder = parsedOrder.filter((id) => id !== "all");
        setTabsOrder(filteredOrder);
      } catch (error) {
        console.error("Ошибка при загрузке порядка табов:", error);
        setTabsOrder(
          baseTabs.filter((tab) => tab.id !== "all").map((tab) => tab.id)
        );
      }
    } else {
      setTabsOrder(
        baseTabs.filter((tab) => tab.id !== "all").map((tab) => tab.id)
      );
    }
  }, []);

  // Получение табов в правильном порядке
  const getOrderedTabs = () => {
    const allTab = baseTabs.find((tab) => tab.id === "all");
    const otherTabs = baseTabs.filter((tab) => tab.id !== "all");

    if (tabsOrder.length === 0) {
      return allTab ? [allTab, ...otherTabs] : otherTabs;
    }

    const orderedTabs = [];

    // Добавляем таб "Все" первым
    if (allTab) {
      orderedTabs.push(allTab);
    }

    // Добавляем остальные табы в сохраненном порядке
    tabsOrder.forEach((tabId) => {
      const tab = otherTabs.find((t) => t.id === tabId);
      if (tab) orderedTabs.push(tab);
    });

    // Добавляем новые табы, которых нет в сохраненном порядке
    otherTabs.forEach((tab) => {
      if (!tabsOrder.includes(tab.id)) {
        orderedTabs.push(tab);
      }
    });

    return orderedTabs;
  };

  const tabs = getOrderedTabs();

  // Обработчик завершения drag & drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id && !isTabsLocked) {
      // Проверяем, что оба элемента не являются табом "Все"
      if (active.id !== "all" && over?.id !== "all") {
        const oldIndex = tabsOrder.indexOf(active.id);
        const newIndex = tabsOrder.indexOf(over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(tabsOrder, oldIndex, newIndex);
          setTabsOrder(newOrder);

          // Сохраняем в localStorage
          localStorage.setItem("favoritesTabsOrder", JSON.stringify(newOrder));
        }
      }
    }
  };

  // Переключение блокировки табов
  const toggleTabsLock = () => {
    const newLockedState = !isTabsLocked;
    setIsTabsLocked(newLockedState);

    // Если разблокируем табы, автоматически разворачиваем их
    if (!newLockedState && isTabsCollapsed) {
      setIsTabsCollapsed(false);
    }
  };

  // Переключение сворачивания табов
  const toggleTabsCollapse = () => {
    setIsTabsCollapsed(!isTabsCollapsed);
  };

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 lg:px-12 py-8">
        <Heart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Избранное пусто
        </h2>
        <p className="text-muted-foreground max-w-md">
          Добавьте фильмы в избранное, нажав на кнопку &quot;+&quot; на карточке
          фильма
        </p>
      </div>
    );
  }

  return (
    <div
      className="px-6 lg:px-12 py-8"
      style={
        pageStylesEnabled
          ? {
              background: "#222121",
              borderTopLeftRadius: "50px",
              borderTopRightRadius: "50px",
              borderTopWidth: "1px",
              borderTopColor: "#6a6767",
              boxShadow: "inset 0px 13px 20px 4px black",
            }
          : {}
      }
    >
      {/* Табы фильтрации */}
      <div className="mb-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div
            className="flex items-center gap-2 p-1 rounded-lg w-fit"
            style={{
              background: "linear-gradient(131deg, #191919, #242323)",
              boxShadow: "7px 5px 8px #000000, inset 2px 2px 20px #303132",
            }}
          >
            {/* Таб "Все" - не перетаскиваемый */}
            {(() => {
              const allTab = tabs.find((tab) => tab.id === "all");
              if (!allTab) return null;
              return (
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setSelectedCountry("");
                    setSelectedGenre("");
                  }}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                    flex items-center gap-2
                    ${
                      activeTab === "all"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                    }
                  `}
                >
                  <span>{allTab.label}</span>
                  {allTab.count > 0 && (
                    <span
                      className={`
                      text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                      ${
                        activeTab === "all"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      }
                    `}
                    >
                      {allTab.count}
                    </span>
                  )}
                </button>
              );
            })()}

            {/* Перетаскиваемые табы */}
            <SortableContext
              items={tabsOrder.filter((id) => id !== "all")}
              strategy={horizontalListSortingStrategy}
            >
              {tabs
                .filter((tab) => tab.id !== "all")
                .slice(0, isTabsCollapsed ? 2 : undefined) // В свернутом состоянии показываем только первые 2 таба (+ "Все" = 3 всего)
                .map((tab) => (
                  <DraggableTab
                    key={tab.id}
                    tab={tab}
                    activeTab={activeTab}
                    isLocked={isTabsLocked}
                    onTabClick={() => {
                      setActiveTab(tab.id);
                      // Сбрасываем выбранную страну и жанр при смене таба
                      if (tab.id !== "countries") {
                        setSelectedCountry("");
                      }
                      if (tab.id !== "genres") {
                        setSelectedGenre("");
                      }
                    }}
                  >
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`
                      text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                      ${
                        activeTab === tab.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground/20 text-muted-foreground"
                      }
                    `}
                      >
                        {tab.count}
                      </span>
                    )}
                  </DraggableTab>
                ))}
            </SortableContext>

            {/* Кнопка сворачивания/разворачивания */}
            <button
              onClick={toggleTabsCollapse}
              className="flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-all duration-200 text-muted-foreground hover:scale-105 active:scale-95"
              style={{
                background: "linear-gradient(131deg, #191919, #242323)",
                boxShadow: "7px 5px 8px #000000, inset 2px 2px 20px #303132",
              }}
              title={isTabsCollapsed ? "Развернуть табы" : "Свернуть табы"}
            >
              {isTabsCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Кнопка Lock/Unlock */}
            <button
              onClick={toggleTabsLock}
              className={`flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                isTabsLocked ? "text-muted-foreground" : "text-primary"
              }`}
              style={{
                background: "linear-gradient(131deg, #191919, #242323)",
                boxShadow: "7px 5px 8px #000000, inset 2px 2px 20px #303132",
              }}
              title={
                isTabsLocked
                  ? "Разблокировать перемещение табов"
                  : "Заблокировать перемещение табов"
              }
            >
              {isTabsLocked ? (
                <Lock className="w-4 h-4" />
              ) : (
                <Unlock className="w-4 h-4" />
              )}
            </button>

            {/* Кнопка "Очистить все" */}
            {favorites.length > 0 && (
              <AlertDialog
                open={showClearDialog}
                onOpenChange={setShowClearDialog}
              >
                <AlertDialogTrigger asChild>
                  <button
                    className="flex items-center justify-center w-8 h-8 rounded-md text-sm font-medium text-destructive transition-all duration-200 hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(131deg, #191919, #242323)",
                      boxShadow:
                        "7px 5px 8px #000000, inset 2px 2px 20px #303132",
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </AlertDialogTrigger>
              </AlertDialog>
            )}
          </div>
        </DndContext>
      </div>

      {/* Чипсы стран */}
      {activeTab === "countries" && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-3">
            Выберите страну:
          </h3>
          <div className="flex flex-wrap gap-2">
            {getUniqueCountries().map((country) => (
              <button
                key={country}
                onClick={() =>
                  setSelectedCountry(selectedCountry === country ? "" : country)
                }
                className={`
                   px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                   ${
                     selectedCountry === country
                       ? "text-white"
                       : "text-muted-foreground hover:text-foreground"
                   }
                 `}
                style={
                  selectedCountry === country
                    ? {
                        background:
                          "linear-gradient(131deg, rgb(0, 49, 243), rgb(36, 8, 255))",
                        boxShadow:
                          "rgb(0, 0, 0) 7px 5px 8px, rgb(57, 92, 255) 2px 2px 20px inset",
                        borderTop: "1px solid transparent",
                        color: "#ffffff",
                      }
                    : {
                        background:
                          "linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))",
                        boxShadow:
                          "rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset",
                        borderTop: "1px solid rgb(84, 84, 84)",
                      }
                }
              >
                {country}
              </button>
            ))}
          </div>
          {selectedCountry && (
            <div className="mt-3 text-sm text-muted-foreground">
              Показаны результаты для страны:{" "}
              <span className="font-medium text-foreground">
                {selectedCountry}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Чипсы жанров */}
      {activeTab === "genres" && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-foreground mb-3">
            Выберите жанр:
          </h3>
          <div className="flex flex-wrap gap-2">
            {getUniqueGenres().map((genre) => (
              <button
                key={genre}
                onClick={() =>
                  setSelectedGenre(selectedGenre === genre ? "" : genre)
                }
                className={`
                   px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                   ${
                     selectedGenre === genre
                       ? "text-white"
                       : "text-muted-foreground hover:text-foreground"
                   }
                 `}
                style={
                  selectedGenre === genre
                    ? {
                        background:
                          "linear-gradient(131deg, rgb(0, 49, 243), rgb(36, 8, 255))",
                        boxShadow:
                          "rgb(0, 0, 0) 7px 5px 8px, rgb(57, 92, 255) 2px 2px 20px inset",
                        borderTop: "1px solid transparent",
                        color: "#ffffff",
                      }
                    : {
                        background:
                          "linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))",
                        boxShadow:
                          "rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset",
                        borderTop: "1px solid rgb(84, 84, 84)",
                      }
                }
              >
                {genre}
              </button>
            ))}
          </div>
          {selectedGenre && (
            <div className="mt-3 text-sm text-muted-foreground">
              Показаны результаты для жанра:{" "}
              <span className="font-medium text-foreground">
                {selectedGenre}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Контент */}
      {filteredFavorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Heart className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            {activeTab === "movies"
              ? "Нет избранных фильмов"
              : activeTab === "series"
              ? "Нет избранных сериалов"
              : activeTab === "cartoons"
              ? "Нет избранных мультфильмов"
              : activeTab === "cartoon-series"
              ? "Нет избранных мультсериалов"
              : activeTab === "countries"
              ? selectedCountry
                ? `Нет контента из страны "${selectedCountry}"`
                : "Выберите страну для фильтрации"
              : activeTab === "genres"
              ? selectedGenre
                ? `Нет контента в жанре "${selectedGenre}"`
                : "Выберите жанр для фильтрации"
              : "Нет контента в этой категории"}
          </h3>
          <p className="text-muted-foreground">
            {activeTab === "movies"
              ? "Добавьте фильмы в избранное"
              : activeTab === "series"
              ? "Добавьте сериалы в избранное"
              : activeTab === "cartoons"
              ? "Добавьте мультфильмы в избранное"
              : activeTab === "cartoon-series"
              ? "Добавьте мультсериалы в избранное"
              : activeTab === "countries"
              ? selectedCountry
                ? "Попробуйте выбрать другую страну"
                : "Выберите страну из списка выше"
              : activeTab === "genres"
              ? selectedGenre
                ? "Попробуйте выбрать другой жанр"
                : "Выберите жанр из списка выше"
              : "Добавьте контент в избранное"}
          </p>
        </div>
      ) : (
        <div
          className="grid gap-4 justify-start"
          style={{ gridTemplateColumns: "repeat(auto-fit, 120px)" }}
          data-mobile="true"
        >
          <style jsx>{`
            @media (min-width: 768px) {
              div[data-mobile="true"] {
                grid-template-columns: repeat(auto-fit, 200px) !important;
              }
            }
          `}</style>
          {filteredFavorites.map((movie) => (
            <div key={movie.id} className="relative group">
              <MovieCard movie={movie} showAllGenres={false} />

              {/* Кнопка удаления из избранного */}
              <button
                onClick={(e) => handleRemoveFromFavorites(movie.id, e)}
                className="absolute top-2 left-2 w-6 h-6 bg-destructive rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/80"
                title="Удалить из избранного"
              >
                <Trash2 className="w-3 h-3 text-destructive-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Alert Dialog для подтверждения удаления всех */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить избранное</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить все фильмы из избранного? Это
              действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            >
              Удалить все
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog для подтверждения удаления отдельного элемента */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить из избранного</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить этот элемент из избранного?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemoveFromFavorites}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/80"
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FavoritesPage;

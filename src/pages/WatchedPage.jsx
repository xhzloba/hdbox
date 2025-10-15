"use client";

import React, { useState, useEffect } from "react";
import { useWatched } from "../contexts/WatchedContext";
import { useSettings } from "../contexts/SettingsContext";
import MovieCardWithSkeleton from "../components/MovieCardWithSkeleton";
import DraggableTab from "../components/DraggableTab";
import {
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Calendar,
  Type,
  ChevronDown,
  Star,
  Clock,
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

const WatchedPage = () => {
  const { watched, removeFromWatched, clearWatched, getWatchedCount } =
    useWatched();
  const { cardShadowsEnabled, pageStylesEnabled } = useSettings();

  console.log("WatchedPage rendered, watched movies count:", watched.length);
  console.log("Watched movies:", watched);

  const [sortBy, setSortBy] = useState("dateAdded");
  const [sortOrder, setSortOrder] = useState("desc");
  const [filterBy, setFilterBy] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [tabs, setTabs] = useState([
    { id: "all", label: "Все", count: 0 },
    { id: "movies", label: "Фильмы", count: 0 },
    { id: "series", label: "Сериалы", count: 0 },
    { id: "cartoons", label: "Мультфильмы", count: 0 },
  ]);

  // Обновляем счетчики в табах
  useEffect(() => {
    const movieCount = watched.filter((item) => item.type === "movie").length;
    const seriesCount = watched.filter((item) => item.type === "series").length;
    const cartoonCount = watched.filter(
      (item) => item.type === "cartoon"
    ).length;

    setTabs([
      { id: "all", label: "Все", count: watched.length },
      { id: "movies", label: "Фильмы", count: movieCount },
      { id: "series", label: "Сериалы", count: seriesCount },
      { id: "cartoons", label: "Мультфильмы", count: cartoonCount },
    ]);
  }, [watched]);

  // Фильтрация по типу контента
  const filteredWatched = watched.filter((movie) => {
    if (filterBy === "all") return true;
    if (filterBy === "movies") return movie.type === "movie";
    if (filterBy === "series") return movie.type === "series";
    if (filterBy === "cartoons") return movie.type === "cartoon";
    return true;
  });

  // Сортировка
  const sortedWatched = [...filteredWatched].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "title":
        comparison = a.title.localeCompare(b.title, "ru");
        break;
      case "year":
        comparison = (a.year || 0) - (b.year || 0);
        break;
      case "rating":
        comparison = (a.rating || 0) - (b.rating || 0);
        break;
      case "dateAdded":
      default:
        // Для сортировки по дате добавления используем индекс в массиве
        const indexA = watched.indexOf(a);
        const indexB = watched.indexOf(b);
        comparison = indexA - indexB;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Пагинация
  const totalPages = Math.ceil(sortedWatched.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedWatched = sortedWatched.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Обработчики
  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const handleFilter = (newFilter) => {
    setFilterBy(newFilter);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Удалены обработчики режима выбора и блокировки

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setTabs((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === "asc" ? (
      <ChevronDown className="w-4 h-4 rotate-180" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (watched.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 lg:px-12 py-8">
        <Eye className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Список просмотренных пуст
        </h2>
        <p className="text-muted-foreground max-w-md">
          Здесь будут отображаться фильмы, сериалы и мультфильмы, которые вы
          отметили как просмотренные. Начните добавлять контент в свой
          список!
        </p>
      </div>
    );
  }

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
      <div className="max-w-7xl">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Просмотренные</h1>
            <span className="text-muted-foreground">
              ({getWatchedCount()})
            </span>
          </div>
          <div className="flex items-center gap-2" />
        </div>

        {/* Табы с фильтрами */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tabs.map((tab) => tab.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-2 mb-6 overflow-x-auto items-center">
              {tabs.map((tab) => (
                <DraggableTab
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  count={tab.count}
                  isActive={filterBy === tab.id}
                  onClick={() => handleFilter(tab.id)}
                />
              ))}
              {/* Кнопка "Очистить все" перенесена в панель табов */}
              {watched.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors ml-2 whitespace-nowrap">
                      <Trash2 className="w-4 h-4 mr-2 inline" />
                      Очистить все
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Очистить просмотренные?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Это действие удалит все фильмы из списка просмотренных.
                        Отменить это действие будет невозможно.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearWatched}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        Очистить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </SortableContext>
        </DndContext>

        {/* Панель управления */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-wrap items-center gap-4">
            {/* Сортировка */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Сортировка:</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleSort("dateAdded")}
                  className={`px-3 py-1 text-sm rounded transition-colors flex items-center gap-1 ${
                    sortBy === "dateAdded"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Дата добавления
                  {getSortIcon("dateAdded")}
                </button>
                <button
                  onClick={() => handleSort("title")}
                  className={`px-3 py-1 text-sm rounded transition-colors flex items-center gap-1 ${
                    sortBy === "title"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Type className="w-3 h-3" />
                  Название
                  {getSortIcon("title")}
                </button>
                <button
                  onClick={() => handleSort("year")}
                  className={`px-3 py-1 text-sm rounded transition-colors flex items-center gap-1 ${
                    sortBy === "year"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Calendar className="w-3 h-3" />
                  Год
                  {getSortIcon("year")}
                </button>
                <button
                  onClick={() => handleSort("rating")}
                  className={`px-3 py-1 text-sm rounded transition-colors flex items-center gap-1 ${
                    sortBy === "rating"
                      ? "bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  }`}
                >
                  <Star className="w-3 h-3" />
                  Рейтинг
                  {getSortIcon("rating")}
                </button>
              </div>
            </div>

            {/* Количество на странице */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">На странице:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 text-sm bg-background border border-border rounded"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Сетка фильмов */}
        {paginatedWatched.length > 0 ? (
          <div
            className="grid gap-4 justify-start mb-8"
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
            {paginatedWatched.map((movie) => (
              <div key={movie.id} className="relative">
                <MovieCardWithSkeleton
                  movie={movie}
                  onRemove={() => removeFromWatched(movie.id)}
                  showRemoveButton={true}
                  removeButtonIcon={<Eye className="w-4 h-4" />}
                  removeButtonText="Убрать из просмотренных"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Нет фильмов в категории "{tabs.find((t) => t.id === filterBy)?.label}"
            </p>
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded transition-colors ${
                      currentPage === pageNum
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchedPage;
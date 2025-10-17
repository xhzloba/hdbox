"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from "../../components/ui/dialog";
import { VisuallyHidden } from "../../components/ui/visually-hidden";
import { ScrollArea } from "../../components/ui/scroll-area";
import "./MovieCard.css";

const FullDescriptionModal = ({ movie, detailedInfo, isOpen, onClose }) => {
  const details = detailedInfo?.details;

  // Убираем backdrop-blur с header при открытой модалке
  React.useEffect(() => {
    if (isOpen) {
      const header = document.querySelector("header");
      if (header) {
        header.style.backdropFilter = "none";
        header.style.backgroundColor = "hsl(var(--background))";
        header.style.borderBottomColor = "transparent";

        return () => {
          if (header) {
            // Восстанавливаем значения из Tailwind классов (без блюра)
            header.style.backdropFilter = "none";
            header.style.borderBottomColor = "";
          }
        };
      }
    }
  }, [isOpen]);

  // Функция для форматирования времени из HH:MM в читаемый формат
  const formatDuration = (duration) => {
    if (!duration) return null;

    let totalMinutes = 0;

    // Если duration числовой формат
    if (typeof duration === "number") {
      totalMinutes = duration;
    } else if (typeof duration === "string") {
      // Если уже содержит "мин" или "ч", возвращаем как есть
      if (duration.includes("мин") || duration.includes("ч")) {
        return duration;
      }

      // Если в формате HH:MM или HH:MM:SS
      if (duration.includes(":")) {
        const parts = duration.split(":").map((num) => parseInt(num, 10));
        const hours = parts[0] || 0;
        const minutes = parts[1] || 0;
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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      modal={true}
    >
      <DialogPortal>
        <DialogOverlay
          style={{
            zIndex: 200000,
            position: "fixed",
            inset: 0,
          }}
        />
        <DialogContent
          className="description-modal max-h-[90vh] overflow-hidden"
          style={{
            width: "65vw",
            maxWidth: "65vw",
            zIndex: 200001,
          }}
          onPointerDownOutside={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onInteractOutside={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onEscapeKeyDown={(e) => {
            e.stopPropagation();
          }}
        >
          {/* Скрытый заголовок для доступности */}
          <VisuallyHidden>
            <DialogTitle>Детальная информация о фильме</DialogTitle>
          </VisuallyHidden>

          {/* Рендерим контент если есть данные (независимо от isOpen для плавного закрытия) */}
          {(detailedInfo || movie) && (
            <ScrollArea className="h-full max-h-[80vh]">
              <div className="p-6 h-full">
                <div className="flex flex-col md:flex-row gap-6 h-full">
                  {/* Левая колонка с информацией */}
                  <div className="flex-1 space-y-6">
                    {/* Основная информация */}
                    {details && (
                      <div className="space-y-4">
                        {/* Заголовок */}
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-1">
                            {details.name}
                          </h2>
                          {details.originalname && (
                            <p className="text-sm text-muted-foreground">
                              {details.originalname}
                            </p>
                          )}
                        </div>

                        {/* Описание */}
                        {details.about && (
                          <div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              Описание
                            </h3>
                            <p className="text-base text-muted-foreground leading-relaxed">
                              {details.about}
                            </p>
                          </div>
                        )}

                        {/* Информация о фильме в сетке */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-4 border-y border-border">
                          {details.released && (
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Год:
                              </span>
                              <p className="text-base font-medium">
                                {details.released}
                              </p>
                            </div>
                          )}
                          {details.duration && (
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Длительность:
                              </span>
                              <p className="text-base font-medium">
                                {formatDuration(details.duration)}
                              </p>
                            </div>
                          )}
                          {detailedInfo?.countries &&
                            detailedInfo.countries.length > 0 && (
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  Страна:
                                </span>
                                <p className="text-base font-medium">
                                  {detailedInfo.countries
                                    .map((c) => c.title)
                                    .join(", ")}
                                </p>
                              </div>
                            )}
                          {detailedInfo?.genres &&
                            detailedInfo.genres.length > 0 && (
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  Жанры:
                                </span>
                                <p className="text-base font-medium">
                                  {detailedInfo.genres
                                    .map((g) => g.title)
                                    .join(", ")}
                                </p>
                              </div>
                            )}
                          {detailedInfo?.directors &&
                            detailedInfo.directors.length > 0 && (
                              <div>
                                <span className="text-sm text-muted-foreground">
                                  Режиссёры:
                                </span>
                                <p className="text-base font-medium">
                                  {detailedInfo.directors
                                    .map((d) => d.title)
                                    .join(", ")}
                                </p>
                              </div>
                            )}
                          {details.rating_kp && (
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Рейтинг КП:
                              </span>
                              <p className="text-base font-medium">
                                {details.rating_kp}
                              </p>
                            </div>
                          )}
                          {details.rating_imdb && (
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Рейтинг IMDb:
                              </span>
                              <p className="text-base font-medium">
                                {details.rating_imdb}
                              </p>
                            </div>
                          )}
                          {details.age && (
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Возраст:
                              </span>
                              <p className="text-base font-medium">
                                {details.age}+
                              </p>
                            </div>
                          )}
                          {movie?.tags && movie.tags.length > 0 && (
                            <div>
                              <span className="text-sm text-muted-foreground">
                                Качество:
                              </span>
                              <div className="flex gap-2 flex-wrap mt-1">
                                {movie.tags.map((tag, index) => (
                                  <span key={index} className="movie-tag">
                                    <span className="movie-tag-text">
                                      {tag}
                                    </span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Fallback если нет детальной информации */}
                    {!detailedInfo && movie && (
                      <div>
                        {movie.description ? (
                          <p className="text-base text-foreground leading-relaxed">
                            {movie.description}
                          </p>
                        ) : (
                          <p className="text-base text-muted-foreground italic">
                            Описания нет
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Правая колонка с постером */}
                  <div
                    className="flex-shrink-0 w-full order-first md:order-last overflow-hidden self-start"
                    style={{ width: "320px" }}
                  >
                    <img
                      src={
                        movie?.poster ||
                        detailedInfo?.details?.poster ||
                        "https://kinohost.web.app/no_poster.png"
                      }
                      alt={movie?.title || details?.name || "Постер"}
                      className="w-full h-auto object-cover object-top rounded-lg shadow-lg"
                      onError={(e) => {
                        e.target.src = "https://kinohost.web.app/no_poster.png";
                      }}
                    />
                  </div>
                </div>

                {/* Актёрский состав на всю ширину */}
                {detailedInfo?.casts && detailedInfo.casts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Актёрский состав
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 justify-items-start">
                      {detailedInfo.casts.map((cast) => (
                        <div
                          key={cast.id}
                          className="flex flex-col items-start text-left"
                        >
                          <div className="w-20 h-20 rounded-full overflow-hidden bg-muted mb-2">
                            <img
                              src={
                                cast.poster ||
                                "https://kinohost.web.app/no_poster.png"
                              }
                              alt={cast.title || "Актёр"}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src =
                                  "https://kinohost.web.app/no_poster.png";
                              }}
                            />
                          </div>
                          {cast.title && (
                            <p className="text-xs text-foreground font-medium line-clamp-2">
                              {cast.title}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default FullDescriptionModal;

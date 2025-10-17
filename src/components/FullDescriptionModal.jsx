"use client";

import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { VisuallyHidden } from "../../components/ui/visually-hidden";
import { ScrollArea } from "../../components/ui/scroll-area";

const FullDescriptionModal = ({ movie, detailedInfo, isOpen, onClose }) => {
  const details = detailedInfo?.details;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="description-modal max-w-5xl max-h-[85vh] overflow-hidden [&[data-slot=dialog-overlay]]:z-[120] [&[data-slot=dialog-content]]:z-[120]">
        {/* Скрытый заголовок для доступности */}
        <VisuallyHidden>
          <DialogTitle>Детальная информация о фильме</DialogTitle>
        </VisuallyHidden>

        <ScrollArea className="h-full max-h-[75vh]">
          <div className="p-6 space-y-6">
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
                <div className="grid grid-cols-2 gap-4 py-4 border-y border-border">
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
                        {details.duration}
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
                      <p className="text-base font-medium">{details.age}+</p>
                    </div>
                  )}
                </div>

                {/* Жанры */}
                {detailedInfo?.genres && detailedInfo.genres.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Жанры
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {detailedInfo.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-muted rounded-full text-sm text-foreground"
                        >
                          {genre.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Страны */}
                {detailedInfo?.countries &&
                  detailedInfo.countries.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Страны
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {detailedInfo.countries.map((country, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-muted rounded-full text-sm text-foreground"
                          >
                            {country.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Режиссёры */}
                {detailedInfo?.directors &&
                  detailedInfo.directors.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Режиссёры
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {detailedInfo.directors.map((director, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-muted rounded-full text-sm text-foreground"
                          >
                            {director.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Актёрский состав */}
                {detailedInfo?.casts && detailedInfo.casts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      Актёрский состав
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {detailedInfo.casts.map((cast) => (
                        <div
                          key={cast.id}
                          className="flex flex-col items-center text-center"
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FullDescriptionModal;

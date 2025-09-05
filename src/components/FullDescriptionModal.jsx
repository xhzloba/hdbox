"use client";

import { Dialog, DialogContent, DialogTitle } from "../../components/ui/dialog";
import { VisuallyHidden } from "../../components/ui/visually-hidden";

const FullDescriptionModal = ({ movie, isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="description-modal max-w-4xl max-h-[80vh] overflow-y-auto [&[data-slot=dialog-overlay]]:z-[120] [&[data-slot=dialog-content]]:z-[120]">
        {/* Скрытый заголовок для доступности */}
        <VisuallyHidden>
          <DialogTitle>Описание фильма</DialogTitle>
        </VisuallyHidden>

        {/* Полное описание фильма - только текст */}
        {movie && (
          <div className="p-6">
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
      </DialogContent>
    </Dialog>
  );
};

export default FullDescriptionModal;

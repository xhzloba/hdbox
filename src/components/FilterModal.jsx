"use client";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Slider } from "../../components/ui/slider";
import { Checkbox } from "../../components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { RotateCcw } from "lucide-react";

const FilterModal = ({ isOpen, onClose, onApplyFilters, initialFilters = {} }) => {
  const currentYear = new Date().getFullYear();
  
  // Состояния для фильтров
  const [yearRange, setYearRange] = useState(initialFilters.yearRange || [1900, currentYear]);
  const [ratingRange, setRatingRange] = useState(initialFilters.ratingRange || [0, 10]);
  const [selectedGenres, setSelectedGenres] = useState(initialFilters.genres || ["all"]);
  const [selectedCountry, setSelectedCountry] = useState(initialFilters.country || "all");
  const [selectedContentType, setSelectedContentType] = useState(initialFilters.contentType || "any");
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "none");

  // Популярные жанры
  const genres = [
    { id: "all", label: "Все" },
    { id: "action", label: "боевик" },
    { id: "fantasy", label: "фэнтези" },
    { id: "sci-fi", label: "фантастика" },
    { id: "thriller", label: "триллер" },
    { id: "war", label: "военный" },
    { id: "detective", label: "детектив" },
    { id: "comedy", label: "комедия" },
    { id: "drama", label: "драма" },
    { id: "horror", label: "ужасы" },
    { id: "crime", label: "криминал" },
    { id: "romance", label: "мелодрама" },
    { id: "western", label: "вестерн" },
    { id: "biography", label: "биография" },
    { id: "anime", label: "аниме" },
    { id: "kids", label: "детский" },
    { id: "cartoon", label: "мультфильм" },
    { id: "noir", label: "фильм-нуар" },
    { id: "adult", label: "для взрослых" },
    { id: "documentary", label: "документальный" },
    { id: "game", label: "игра" },
    { id: "history", label: "история" },
    { id: "concert", label: "концерт" },
    { id: "short", label: "короткометражка" },
    { id: "music", label: "музыка" },
    { id: "musical", label: "мюзикл" },
    { id: "news", label: "новости" },
    { id: "adventure", label: "приключения" },
    { id: "reality", label: "реальное ТВ" },
    { id: "family", label: "семейный" },
    { id: "sport", label: "спорт" },
    { id: "talk-show", label: "ток-шоу" },
    { id: "ceremony", label: "церемония" },
    { id: "dorama", label: "дорама" },
  ];

  // Популярные страны
  const countries = [
    { value: "all", label: "Все страны" },
    { value: "usa", label: "США" },
    { value: "russia", label: "Россия" },
    { value: "uk", label: "Великобритания" },
    { value: "france", label: "Франция" },
    { value: "germany", label: "Германия" },
    { value: "japan", label: "Япония" },
    { value: "south-korea", label: "Южная Корея" },
    { value: "india", label: "Индия" },
    { value: "canada", label: "Канада" },
    { value: "australia", label: "Австралия" },
  ];

  // Типы контента
  const contentTypes = [
    { value: "any", label: "Любой" },
    { value: "movies", label: "Фильмы" },
    { value: "series", label: "Сериалы" },
    { value: "cartoons", label: "Мультфильмы" },
    { value: "cartoon-series", label: "Мультсериалы" },
    { value: "anime", label: "Аниме" },
  ];

  // Варианты сортировки
  const sortOptions = [
    { value: "none", label: "Без сортировки" },
    { value: "popularity", label: "По популярности" },
    { value: "update_date", label: "По дате обновления" },
    { value: "add_date", label: "По дате добавления" },
    { value: "rating", label: "По рейтингу" },
  ];

  // Обработчик изменения жанров
  const handleGenreChange = (genreId, checked) => {
    if (genreId === "all") {
      // Если выбрали "Все", то снимаем все остальные жанры
      if (checked) {
        setSelectedGenres(["all"]);
      } else {
        setSelectedGenres([]);
      }
    } else {
      // Если выбрали конкретный жанр
      if (checked) {
        // Убираем "Все" и добавляем выбранный жанр
        setSelectedGenres(prev => {
          const newGenres = prev.filter(id => id !== "all");
          return [...newGenres, genreId];
        });
      } else {
        // Убираем выбранный жанр
        setSelectedGenres(prev => {
          const newGenres = prev.filter(id => id !== genreId);
          // Если не осталось жанров, выбираем "Все"
          return newGenres.length === 0 ? ["all"] : newGenres;
        });
      }
    }
  };

  // Сброс всех фильтров
  const handleResetFilters = () => {
    setYearRange([1900, currentYear]);
    setRatingRange([0, 10]);
    setSelectedGenres(["all"]);
    setSelectedCountry("all");
    setSelectedContentType("any");
    setSortBy("none");
  };

  // Применение фильтров
  const handleApplyFilters = () => {
    const filters = {
      yearRange,
      ratingRange,
      genres: selectedGenres,
      country: selectedCountry,
      contentType: selectedContentType,
      sortBy,
    };
    onApplyFilters(filters);
    onClose();
  };

  // Обновление состояний при изменении initialFilters
  useEffect(() => {
    if (initialFilters.yearRange) setYearRange(initialFilters.yearRange);
    if (initialFilters.ratingRange) setRatingRange(initialFilters.ratingRange);
    if (initialFilters.genres) setSelectedGenres(initialFilters.genres);
    if (initialFilters.country !== undefined) setSelectedCountry(initialFilters.country);
    if (initialFilters.contentType !== undefined) setSelectedContentType(initialFilters.contentType);
    if (initialFilters.sortBy) setSortBy(initialFilters.sortBy);
  }, [initialFilters]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-background border border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-foreground">
            Фильтры и сортировка
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Настройте параметры для поиска фильмов и сериалов
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Левая колонка */}
          <div className="space-y-6">
            {/* Фильтр по году */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Год выпуска</Label>
              <div className="px-3">
                <Slider
                  value={yearRange}
                  onValueChange={setYearRange}
                  min={1900}
                  max={currentYear}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{yearRange[0]}</span>
                  <span>{yearRange[1]}</span>
                </div>
              </div>
            </div>

            {/* Фильтр по типу контента */}
            <div className="space-y-3">
              <Label className="text-sm font-medium text-foreground">Тип контента</Label>
              <Select value={selectedContentType} onValueChange={setSelectedContentType}>
                <SelectTrigger className="w-full bg-background border-border text-foreground">
                  <SelectValue placeholder="Выберите тип контента" />
                </SelectTrigger>
                <SelectContent className="bg-background border-border">
                  {contentTypes.map((type) => (
                    <SelectItem
                      key={type.value}
                      value={type.value}
                      className="text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Правая колонка */}
           <div className="space-y-6">
             {/* Фильтр по рейтингу */}
             <div className="space-y-3">
               <Label className="text-sm font-medium text-foreground">Рейтинг</Label>
               <div className="px-3">
                 <Slider
                   value={ratingRange}
                   onValueChange={setRatingRange}
                   min={0}
                   max={10}
                   step={0.1}
                   className="w-full"
                 />
                 <div className="flex justify-between text-xs text-muted-foreground mt-1">
                   <span>{ratingRange[0]}</span>
                   <span>{ratingRange[1]}</span>
                 </div>
               </div>
             </div>

             {/* Фильтр по стране */}
             <div className="space-y-3">
               <Label className="text-sm font-medium text-foreground">Страна</Label>
               <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                 <SelectTrigger className="w-full bg-background border-border text-foreground">
                   <SelectValue placeholder="Выберите страну" />
                 </SelectTrigger>
                 <SelectContent className="bg-background border-border">
                   {countries.map((country) => (
                     <SelectItem
                       key={country.value}
                       value={country.value}
                       className="text-foreground hover:bg-accent hover:text-accent-foreground"
                     >
                       {country.label}
                     </SelectItem>
                   ))}
                 </SelectContent>
               </Select>
             </div>
           </div>
         </div>

         {/* Фильтр по жанрам - на всю ширину */}
         <div className="space-y-3">
           <Label className="text-sm font-medium text-foreground">Жанры</Label>
           <div className="flex flex-wrap gap-3">
             {genres.map((genre) => (
               <div key={genre.id} className="flex items-center space-x-2">
                 <Checkbox
                   id={genre.id}
                   checked={selectedGenres.includes(genre.id)}
                   onCheckedChange={(checked) => handleGenreChange(genre.id, checked)}
                   className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                 />
                 <Label
                   htmlFor={genre.id}
                   className="text-sm text-foreground cursor-pointer"
                 >
                   {genre.label}
                 </Label>
               </div>
             ))}
           </div>
         </div>

         {/* Сортировка - на всю ширину */}
         <div className="space-y-3">
           <Label className="text-sm font-medium text-foreground">Сортировать</Label>
           <Select value={sortBy} onValueChange={setSortBy}>
             <SelectTrigger className="w-full bg-background border-border text-foreground">
               <SelectValue placeholder="Выберите сортировку" />
             </SelectTrigger>
             <SelectContent className="bg-background border-border">
               {sortOptions.map((option) => (
                 <SelectItem
                   key={option.value}
                   value={option.value}
                   className="text-foreground hover:bg-accent hover:text-accent-foreground"
                 >
                   {option.label}
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
         </div>

        <DialogFooter className="flex justify-between items-center pt-4">
          <Button
            variant="outline"
            onClick={handleResetFilters}
            className="flex items-center gap-2 border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <RotateCcw className="w-4 h-4" />
            Сбросить
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
            >
              Отмена
            </Button>
            <Button
              onClick={handleApplyFilters}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Применить
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterModal;
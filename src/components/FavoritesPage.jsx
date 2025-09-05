'use client'

import React, { useState } from 'react'
import { useFavorites } from '../contexts/FavoritesContext'
import MovieCard from '../components/MovieCard'
import { Heart, Trash2 } from 'lucide-react'
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
} from "../../components/ui/alert-dialog"

const FavoritesPage = () => {
  const { favorites, removeFromFavorites, clearFavorites, getFavoritesCount } = useFavorites()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [showClearDialog, setShowClearDialog] = useState(false)

  const handleRemoveFromFavorites = (movieId, e) => {
    e.stopPropagation()
    removeFromFavorites(movieId)
  }

  const handleClearAll = () => {
    clearFavorites()
    setShowClearDialog(false)
  }

  // Получение уникальных стран из избранных элементов
  const getUniqueCountries = () => {
    const countries = favorites
      .map(item => item.country)
      .filter(country => country && country.trim() !== '')
      .map(country => {
        // Обрабатываем случаи когда страна может быть строкой с несколькими странами
        if (typeof country === 'string' && country.includes(',')) {
          return country.split(',').map(c => c.trim())
        }
        return country
      })
      .flat()
      .filter(country => country && country.trim() !== '')
    
    return [...new Set(countries)].sort()
  }

  // Получение уникальных жанров из всех жанров избранных элементов
  const getUniqueGenres = () => {
    const genres = favorites
      .map(item => item.genre)
      .filter(genre => genre)
      .map(genre => {
        // Обрабатываем случаи когда жанр может быть массивом или строкой
        if (Array.isArray(genre)) {
          return genre
        } else if (typeof genre === 'string' && genre.includes(',')) {
          return genre.split(',').map(g => g.trim())
        }
        return [genre]
      })
      .flat()
      .filter(genre => genre && genre.trim() !== '')
      .map(genre => genre.trim())
    
    return [...new Set(genres)].sort()
  }

  // Фильтрация контента по типу и стране
  const getFilteredFavorites = () => {
    let filtered = []
    
    switch (activeTab) {
      case 'movies':
        filtered = favorites.filter(item => item.type === 'movie')
        break
      case 'series':
        filtered = favorites.filter(item => item.type === 'tv' || item.type === 'serial')
        break
      case 'cartoons':
        filtered = favorites.filter(item => item.type === 'multfilm')
        break
      case 'cartoon-series':
        filtered = favorites.filter(item => item.type === 'multfilm' && item.genre && (Array.isArray(item.genre) ? item.genre.some(g => g.includes('сериал')) : item.genre.includes('сериал')))
        break
      case 'countries':
         if (selectedCountry) {
           filtered = favorites.filter(item => {
             if (!item.country) return false
             // Проверяем точное совпадение или вхождение в список стран через запятую
             if (typeof item.country === 'string') {
               return item.country === selectedCountry || 
                      item.country.split(',').map(c => c.trim()).includes(selectedCountry)
             }
             return item.country === selectedCountry
           })
         } else {
           filtered = favorites
         }
         break
       case 'genres':
         if (selectedGenre) {
           filtered = favorites.filter(item => {
             if (!item.genre) return false
             // Проверяем вхождение жанра в массив или строку жанров
             if (Array.isArray(item.genre)) {
               return item.genre.includes(selectedGenre)
             } else if (typeof item.genre === 'string') {
               if (item.genre.includes(',')) {
                 return item.genre.split(',').map(g => g.trim()).includes(selectedGenre)
               }
               return item.genre.trim() === selectedGenre
             }
             return false
           })
         } else {
           filtered = favorites
         }
         break
      case 'all':
      default:
        filtered = favorites
        break
    }
    
    return filtered
  }

  const filteredFavorites = getFilteredFavorites()

  const tabs = [
    { id: 'all', label: 'Все', count: favorites.length },
    { id: 'movies', label: 'Фильмы', count: favorites.filter(item => item.type === 'movie').length },
    { id: 'series', label: 'Сериалы', count: favorites.filter(item => item.type === 'tv' || item.type === 'serial').length },
    { id: 'cartoons', label: 'Мультфильмы', count: favorites.filter(item => item.type === 'multfilm').length },
    { id: 'cartoon-series', label: 'Мультсериалы', count: favorites.filter(item => item.type === 'multfilm' && item.genre && (Array.isArray(item.genre) ? item.genre.some(g => g.includes('сериал')) : item.genre.includes('сериал'))).length },
    { id: 'countries', label: 'По странам', count: getUniqueCountries().length },
    { id: 'genres', label: 'По жанрам', count: getUniqueGenres().length },
  ]

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4 md:p-6">
        <Heart className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Избранное пусто</h2>
        <p className="text-muted-foreground max-w-md">
          Добавьте фильмы в избранное, нажав на кнопку &quot;+&quot; на карточке фильма
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            Избранное ({getFavoritesCount()})
          </h1>
        </div>
        

      </div>

      {/* Табы фильтрации */}
      <div className="mb-6">
        <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                // Сбрасываем выбранную страну и жанр при смене таба
                if (tab.id !== 'countries') {
                  setSelectedCountry('')
                }
                if (tab.id !== 'genres') {
                  setSelectedGenre('')
                }
              }}
              className={`
                px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
                flex items-center gap-2
                ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }
              `}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`
                  text-xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center
                  ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted-foreground/20 text-muted-foreground'
                  }
                `}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          
          {/* Кнопка "Очистить все" */}
          {favorites.length > 0 && (
            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
              <AlertDialogTrigger asChild>
                <button className="px-4 py-2 rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-all duration-200 flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Очистить все
                </button>
              </AlertDialogTrigger>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Чипсы стран */}
       {activeTab === 'countries' && (
         <div className="mb-6">
           <h3 className="text-lg font-medium text-foreground mb-3">Выберите страну:</h3>
           <div className="flex flex-wrap gap-2">
             {getUniqueCountries().map((country) => (
               <button
                 key={country}
                 onClick={() => setSelectedCountry(selectedCountry === country ? '' : country)}
                 className={`
                   px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                   ${
                     selectedCountry === country
                       ? 'bg-primary text-primary-foreground shadow-sm'
                       : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                   }
                 `}
               >
                 {country}
               </button>
             ))}
           </div>
           {selectedCountry && (
             <div className="mt-3 text-sm text-muted-foreground">
               Показаны результаты для страны: <span className="font-medium text-foreground">{selectedCountry}</span>
             </div>
           )}
         </div>
       )}

       {/* Чипсы жанров */}
       {activeTab === 'genres' && (
         <div className="mb-6">
           <h3 className="text-lg font-medium text-foreground mb-3">Выберите жанр:</h3>
           <div className="flex flex-wrap gap-2">
             {getUniqueGenres().map((genre) => (
               <button
                 key={genre}
                 onClick={() => setSelectedGenre(selectedGenre === genre ? '' : genre)}
                 className={`
                   px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200
                   ${
                     selectedGenre === genre
                       ? 'bg-primary text-primary-foreground shadow-sm'
                       : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                   }
                 `}
               >
                 {genre}
               </button>
             ))}
           </div>
           {selectedGenre && (
             <div className="mt-3 text-sm text-muted-foreground">
               Показаны результаты для жанра: <span className="font-medium text-foreground">{selectedGenre}</span>
             </div>
           )}
         </div>
       )}

      {/* Контент */}
      {filteredFavorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
          <Heart className="w-12 h-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            {activeTab === 'movies' ? 'Нет избранных фильмов' : 
             activeTab === 'series' ? 'Нет избранных сериалов' : 
             activeTab === 'cartoons' ? 'Нет избранных мультфильмов' :
             activeTab === 'cartoon-series' ? 'Нет избранных мультсериалов' :
             activeTab === 'countries' ? (selectedCountry ? `Нет контента из страны "${selectedCountry}"` : 'Выберите страну для фильтрации') :
             activeTab === 'genres' ? (selectedGenre ? `Нет контента в жанре "${selectedGenre}"` : 'Выберите жанр для фильтрации') :
             'Нет контента в этой категории'}
          </h3>
          <p className="text-muted-foreground">
            {activeTab === 'movies' ? 'Добавьте фильмы в избранное' : 
             activeTab === 'series' ? 'Добавьте сериалы в избранное' : 
             activeTab === 'cartoons' ? 'Добавьте мультфильмы в избранное' :
             activeTab === 'cartoon-series' ? 'Добавьте мультсериалы в избранное' :
             activeTab === 'countries' ? (selectedCountry ? 'Попробуйте выбрать другую страну' : 'Выберите страну из списка выше') :
             activeTab === 'genres' ? (selectedGenre ? 'Попробуйте выбрать другой жанр' : 'Выберите жанр из списка выше') :
             'Добавьте контент в избранное'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 justify-start" style={{gridTemplateColumns: 'repeat(auto-fit, 120px)'}} data-mobile="true">
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
      
      {/* Alert Dialog для подтверждения удаления */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Очистить избранное</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить все фильмы из избранного? Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/80">
              Удалить все
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default FavoritesPage
'use client'

import React, { useContext, useState, useEffect } from 'react'
import { Settings } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog'
import SettingsContext from '../contexts/SettingsContext'

const SettingsModal = ({ isOpen, onClose }) => {
  const settingsContext = useContext(SettingsContext)
  
  // Если контекст не доступен, не рендерим диалог
  if (!settingsContext) {
    return null
  }
  
  const { showDetails, toggleShowDetails, showRatingAsIcons, toggleShowRatingAsIcons, defaultPlayer, setDefaultPlayer } = settingsContext
  // Временное состояние для настроек до подтверждения
  const [tempShowDetails, setTempShowDetails] = useState(showDetails)
  const [tempShowRatingAsIcons, setTempShowRatingAsIcons] = useState(showRatingAsIcons)
  const [tempDefaultPlayer, setTempDefaultPlayer] = useState(defaultPlayer)

  // Синхронизируем временное состояние с основным при открытии
  useEffect(() => {
    if (isOpen) {
      setTempShowDetails(showDetails)
      setTempShowRatingAsIcons(showRatingAsIcons)
      setTempDefaultPlayer(defaultPlayer)
    }
  }, [isOpen, showDetails, showRatingAsIcons, defaultPlayer])

  const handleConfirm = () => {
    // Применяем изменения только при подтверждении
    if (tempShowDetails !== showDetails) {
      toggleShowDetails()
    }
    if (tempShowRatingAsIcons !== showRatingAsIcons) {
      toggleShowRatingAsIcons()
    }
    if (tempDefaultPlayer !== defaultPlayer) {
      setDefaultPlayer(tempDefaultPlayer)
    }
    onClose()
  }

  const handleCancel = () => {
    // Сбрасываем временные изменения
    setTempShowDetails(showDetails)
    setTempShowRatingAsIcons(showRatingAsIcons)
    setTempDefaultPlayer(defaultPlayer)
    onClose()
  }

  const handleToggleTemp = () => {
    setTempShowDetails(!tempShowDetails)
  }

  const handleToggleRatingTemp = () => {
    setTempShowRatingAsIcons(!tempShowRatingAsIcons)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleCancel}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            Настройки
          </AlertDialogTitle>
          <AlertDialogDescription>
            Настройте отображение карточек фильмов и сериалов
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Settings Content */}
        <div className="space-y-6">
          {/* Movie Card Settings Section */}
          <div>
            <h3 className="text-sm font-medium mb-4">Отображение карточек</h3>
            
            {/* Show Details Toggle */}
            <div 
              onClick={handleToggleTemp}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                tempShowDetails ? 'bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground' : 'bg-muted/30'
              }`}
            >
              <div className="flex flex-col">
                <label className={`text-sm font-medium mb-1 ${
                  tempShowDetails ? 'text-sidebar-primary-foreground' : ''
                }`}>
                  Показывать детали
                </label>
                <p className={`text-xs ${
                  tempShowDetails ? 'text-sidebar-primary-foreground/80' : 'text-muted-foreground'
                }`}>
                  Название, год, жанр и кнопка избранного
                </p>
              </div>
              
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                  tempShowDetails ? 'bg-sidebar-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                    tempShowDetails ? 'translate-x-6 bg-sidebar-primary-foreground' : 'translate-x-1 bg-white'
                  }`}
                />
              </button>
            </div>
            
            {/* Show Rating as Icons Toggle */}
            <div 
              onClick={handleToggleRatingTemp}
              className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer mt-3 ${
                tempShowRatingAsIcons ? 'bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground' : 'bg-muted/30'
              }`}
            >
              <div className="flex flex-col">
                <label className={`text-sm font-medium mb-1 ${
                  tempShowRatingAsIcons ? 'text-sidebar-primary-foreground' : ''
                }`}>
                  Рейтинг иконками
                </label>
                <p className={`text-xs ${
                  tempShowRatingAsIcons ? 'text-sidebar-primary-foreground/80' : 'text-muted-foreground'
                }`}>
                  Отображать рейтинг иконками
                </p>
              </div>
              
              <button
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-sidebar-primary focus:ring-offset-2 ${
                  tempShowRatingAsIcons ? 'bg-sidebar-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full transition-transform shadow-sm ${
                    tempShowRatingAsIcons ? 'translate-x-6 bg-sidebar-primary-foreground' : 'translate-x-1 bg-white'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Default Player Settings Section */}
          <div>
            <h3 className="text-sm font-medium mb-4">Плеер по умолчанию</h3>
            
            <div className="space-y-3">
              {/* Renewall Option */}
              <div 
                onClick={() => setTempDefaultPlayer('renewall')}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  tempDefaultPlayer === 'renewall' ? 'bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tempDefaultPlayer === 'renewall' ? 'border-sidebar-primary-foreground' : 'border-muted-foreground'
                  }`}>
                    {tempDefaultPlayer === 'renewall' && (
                      <div className="w-2 h-2 rounded-full bg-sidebar-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      tempDefaultPlayer === 'renewall' ? 'text-sidebar-primary-foreground' : ''
                    }`}>
                      Renewall
                    </label>
                    <p className={`text-xs ${
                      tempDefaultPlayer === 'renewall' ? 'text-sidebar-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      Высокое качество, стабильная работа
                    </p>
                  </div>
                </div>
              </div>

              {/* Turbo Option */}
              <div 
                onClick={() => setTempDefaultPlayer('turbo')}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  tempDefaultPlayer === 'turbo' ? 'bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tempDefaultPlayer === 'turbo' ? 'border-sidebar-primary-foreground' : 'border-muted-foreground'
                  }`}>
                    {tempDefaultPlayer === 'turbo' && (
                      <div className="w-2 h-2 rounded-full bg-sidebar-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      tempDefaultPlayer === 'turbo' ? 'text-sidebar-primary-foreground' : ''
                    }`}>
                      Turbo
                    </label>
                    <p className={`text-xs ${
                      tempDefaultPlayer === 'turbo' ? 'text-sidebar-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      Быстрая загрузка, хорошее качество
                    </p>
                  </div>
                </div>
              </div>

              {/* Alloha Option */}
              <div 
                onClick={() => setTempDefaultPlayer('alloha')}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                  tempDefaultPlayer === 'alloha' ? 'bg-sidebar-primary border-sidebar-primary text-sidebar-primary-foreground' : 'bg-muted/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                    tempDefaultPlayer === 'alloha' ? 'border-sidebar-primary-foreground' : 'border-muted-foreground'
                  }`}>
                    {tempDefaultPlayer === 'alloha' && (
                      <div className="w-2 h-2 rounded-full bg-sidebar-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <label className={`text-sm font-medium ${
                      tempDefaultPlayer === 'alloha' ? 'text-sidebar-primary-foreground' : ''
                    }`}>
                      Alloha
                    </label>
                    <p className={`text-xs ${
                      tempDefaultPlayer === 'alloha' ? 'text-sidebar-primary-foreground/80' : 'text-muted-foreground'
                    }`}>
                      Альтернативный плеер, множественные источники
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm}>
            Подтвердить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default SettingsModal
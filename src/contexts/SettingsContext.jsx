'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [showDetails, setShowDetails] = useState(true)
  const [showRatingAsIcons, setShowRatingAsIcons] = useState(true)
  const [showFavoriteButton, setShowFavoriteButton] = useState(true)
  const [cardShadowsEnabled, setCardShadowsEnabled] = useState(true)
  const [defaultPlayer, setDefaultPlayer] = useState('renewall')
  const [isLoaded, setIsLoaded] = useState(false)

  // Загрузка настроек из localStorage при инициализации
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('movieCardSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        setShowDetails(settings.showDetails ?? true)
        setShowRatingAsIcons(settings.showRatingAsIcons ?? true)
        setShowFavoriteButton(settings.showFavoriteButton ?? true)
        setCardShadowsEnabled(settings.cardShadowsEnabled ?? true)
        setDefaultPlayer(settings.defaultPlayer ?? 'renewall')
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Сохранение настроек в localStorage при изменении
  useEffect(() => {
    if (isLoaded) {
      try {
        const settings = {
          showDetails,
          showRatingAsIcons,
          showFavoriteButton,
          cardShadowsEnabled,
          defaultPlayer
        }
        localStorage.setItem('movieCardSettings', JSON.stringify(settings))
      } catch (error) {
        console.error('Ошибка сохранения настроек:', error)
      }
    }
  }, [showDetails, showRatingAsIcons, showFavoriteButton, cardShadowsEnabled, defaultPlayer, isLoaded])

  const toggleShowDetails = () => {
    setShowDetails(prev => !prev)
  }

  const toggleShowRatingAsIcons = () => {
    setShowRatingAsIcons(prev => !prev)
  }

  const toggleShowFavoriteButton = () => {
    setShowFavoriteButton(prev => !prev)
  }

  const toggleCardShadows = () => {
    setCardShadowsEnabled(prev => !prev)
  }

  const value = {
    showDetails,
    setShowDetails,
    toggleShowDetails,
    showRatingAsIcons,
    setShowRatingAsIcons,
    toggleShowRatingAsIcons,
    showFavoriteButton,
    setShowFavoriteButton,
    toggleShowFavoriteButton,
    cardShadowsEnabled,
    setCardShadowsEnabled,
    toggleCardShadows,
    defaultPlayer,
    setDefaultPlayer,
    isLoaded
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}

export default SettingsContext
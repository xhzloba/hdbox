'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import CryptoJS from 'crypto-js'

const ParentalControlContext = createContext()

export const useParentalControl = () => {
  const context = useContext(ParentalControlContext)
  if (!context) {
    throw new Error('useParentalControl must be used within a ParentalControlProvider')
  }
  return context
}

export const ParentalControlProvider = ({ children }) => {
  const [isParentalControlEnabled, setIsParentalControlEnabled] = useState(false)
  const [hasPin, setHasPin] = useState(false)
  const [unlockedMovies, setUnlockedMovies] = useState([])

  // Загрузка состояния из localStorage при инициализации
  useEffect(() => {
    const savedState = localStorage.getItem('parentalControlEnabled')
    const savedPin = localStorage.getItem('parentalControlPin')
    
    if (savedState === 'true') {
      setIsParentalControlEnabled(true)
    }
    
    if (savedPin) {
      setHasPin(true)
    }
  }, [])

  // Функция для хеширования PIN-кода
  const hashPin = (pin) => {
    return CryptoJS.SHA256(pin).toString()
  }

  // Функция для установки PIN-кода
  const setPin = (pin) => {
    const hashedPin = hashPin(pin)
    localStorage.setItem('parentalControlPin', hashedPin)
    setHasPin(true)
  }

  // Функция для валидации PIN-кода
  const validatePin = (pin) => {
    const hashedPin = hashPin(pin)
    const savedHashedPin = localStorage.getItem('parentalControlPin')
    return hashedPin === savedHashedPin
  }

  // Функция для включения родительского контроля
  const enableParentalControl = (pin) => {
    if (!isParentalControlEnabled) {
      // Если родительский контроль отключен, всегда устанавливаем новый PIN
      setPin(pin)
    } else {
      // Если родительский контроль уже включен, проверяем существующий PIN
      if (!validatePin(pin)) {
        return false // Неверный PIN
      }
    }
    
    setIsParentalControlEnabled(true)
    localStorage.setItem('parentalControlEnabled', 'true')
    return true
  }

  // Функция для отключения родительского контроля
  const disableParentalControl = (pin) => {
    if (!validatePin(pin)) {
      return false // Неверный PIN
    }
    
    setIsParentalControlEnabled(false)
    localStorage.setItem('parentalControlEnabled', 'false')
    // Очищаем список разблокированных фильмов при отключении родительского контроля
    setUnlockedMovies([])
    return true
  }

  // Функция для добавления фильма в список разблокированных
  const addUnlockedMovie = (movieId) => {
    setUnlockedMovies(prev => {
      if (!prev.includes(movieId)) {
        return [...prev, movieId]
      }
      return prev
    })
  }

  // Функция для очистки списка разблокированных фильмов
  const clearUnlockedMovies = () => {
    setUnlockedMovies([])
  }

  // Функция для проверки, разблокирован ли фильм
  const isMovieUnlocked = (movieId) => {
    return unlockedMovies.includes(movieId)
  }

  // Функция для проверки доступа к контенту 18+
  const canAccessAdultContent = (movieAge) => {
    // Если возрастное ограничение не указано, разрешаем доступ
    if (!movieAge) return true
    
    // Если родительский контроль отключен, разрешаем доступ
    if (!isParentalControlEnabled) return true
    
    // Проверяем возрастное ограничение
    const age = parseInt(movieAge)
    return age < 18
  }

  // Функция для проверки, является ли контент 18+
  const isAdultContent = (movieAge) => {
    if (!movieAge) return false
    const age = parseInt(movieAge)
    return age >= 18
  }

  const value = {
    isParentalControlEnabled,
    hasPin,
    enableParentalControl,
    disableParentalControl,
    validatePin,
    canAccessAdultContent,
    isAdultContent,
    unlockedMovies,
    addUnlockedMovie,
    clearUnlockedMovies,
    isMovieUnlocked
  }

  return (
    <ParentalControlContext.Provider value={value}>
      {children}
    </ParentalControlContext.Provider>
  )
}

export default ParentalControlContext
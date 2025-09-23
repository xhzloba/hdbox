import React, { useEffect, useState } from 'react'
import { useFavorites } from '../contexts/FavoritesContext'

const FlyingPoster = () => {
  const { animatingMovie, onAnimationComplete } = useFavorites()
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0.8)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    let animationTimer, fadeTimer, completeTimer, hideTimer
    
    // Упрощенная логика - запускаем анимацию если есть animatingMovie
    if (animatingMovie) {
      setIsVisible(true)
      setOpacity(0.8)
      setIsAnimating(false)
      setPosition({ x: animatingMovie.startX, y: animatingMovie.startY })
      
      // Находим позицию пункта "Избранное" в меню
      const favoritesElement = document.querySelector('[data-menu-id="favorites"]')
      if (favoritesElement) {
        const rect = favoritesElement.getBoundingClientRect()
        const targetX = rect.left + rect.width / 2
        const targetY = rect.top + rect.height / 2
        
        // Запускаем анимацию через небольшую задержку
        animationTimer = setTimeout(() => {
          setIsAnimating(true)
          setPosition({ x: targetX, y: targetY })
        }, 50)
        
        // Начинаем плавное затухание через 600мс (раньше для плавности)
        fadeTimer = setTimeout(() => {
          setOpacity(0)
        }, 600)
        
        // Уведомляем о завершении анимации через 900мс
        completeTimer = setTimeout(() => {
          if (onAnimationComplete) {
            onAnimationComplete()
          }
        }, 900)
      }
      
      // Скрываем элемент после завершения анимации через 950мс
      hideTimer = setTimeout(() => {
        setIsVisible(false)
        setIsAnimating(false)
        setOpacity(0.8) // Сбрасываем opacity для следующей анимации
      }, 950)
    }
    
    // Cleanup функция для очистки всех таймеров
    return () => {
      if (animationTimer) clearTimeout(animationTimer)
      if (fadeTimer) clearTimeout(fadeTimer)
      if (completeTimer) clearTimeout(completeTimer)
      if (hideTimer) clearTimeout(hideTimer)
    }
  }, [animatingMovie, onAnimationComplete])

  if (!isVisible || !animatingMovie) {
    return null
  }

  return (
    <div
      className="fixed pointer-events-none z-[9999]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        opacity: opacity,
        transition: isAnimating 
          ? 'left 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top 800ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 350ms cubic-bezier(0.4, 0.0, 0.2, 1)'
          : 'none'
      }}
    >
      <div className="w-12 h-16 rounded-lg overflow-hidden shadow-lg">
        <img
          src={animatingMovie.poster || "https://kinohost.web.app/no_poster.png"}
          alt="Flying poster"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://kinohost.web.app/no_poster.png';
          }}
        />
      </div>
    </div>
  )
}

export default FlyingPoster
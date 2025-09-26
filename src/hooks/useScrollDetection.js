import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Хук для определения активного скролла и оптимизации производительности
 * @param {number} throttleMs - Задержка для throttle (по умолчанию 16ms для 60fps)
 * @param {number} scrollEndDelay - Задержка для определения окончания скролла (по умолчанию 150ms)
 * @returns {Object} - { isScrolling, scrollDirection, scrollSpeed }
 */
export const useScrollDetection = (throttleMs = 16, scrollEndDelay = 150) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollDirection, setScrollDirection] = useState('none'); // 'up', 'down', 'none'
  const [scrollSpeed, setScrollSpeed] = useState(0);
  
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(0);
  const scrollEndTimer = useRef(null);
  const throttleTimer = useRef(null);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const currentTime = Date.now();
    
    // Вычисляем направление скролла
    const deltaY = currentScrollY - lastScrollY.current;
    const deltaTime = currentTime - lastScrollTime.current;
    
    if (Math.abs(deltaY) > 1) { // Игнорируем микро-движения
      setScrollDirection(deltaY > 0 ? 'down' : 'up');
      
      // Вычисляем скорость скролла (пикселей в миллисекунду)
      const speed = deltaTime > 0 ? Math.abs(deltaY) / deltaTime : 0;
      setScrollSpeed(speed);
      
      setIsScrolling(true);
    }
    
    lastScrollY.current = currentScrollY;
    lastScrollTime.current = currentTime;
    
    // Сбрасываем таймер окончания скролла
    if (scrollEndTimer.current) {
      clearTimeout(scrollEndTimer.current);
    }
    
    scrollEndTimer.current = setTimeout(() => {
      setIsScrolling(false);
      setScrollDirection('none');
      setScrollSpeed(0);
    }, scrollEndDelay);
  }, [scrollEndDelay]);

  const throttledHandleScroll = useCallback(() => {
    if (throttleTimer.current) return;
    
    throttleTimer.current = setTimeout(() => {
      handleScroll();
      throttleTimer.current = null;
    }, throttleMs);
  }, [handleScroll, throttleMs]);

  useEffect(() => {
    // Инициализируем начальную позицию
    lastScrollY.current = window.pageYOffset || document.documentElement.scrollTop;
    lastScrollTime.current = Date.now();
    
    // Добавляем слушатель с пассивным режимом для лучшей производительности
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollEndTimer.current) {
        clearTimeout(scrollEndTimer.current);
      }
      if (throttleTimer.current) {
        clearTimeout(throttleTimer.current);
      }
    };
  }, [throttledHandleScroll]);

  return {
    isScrolling,
    scrollDirection,
    scrollSpeed,
    // Дополнительные утилиты
    isFastScrolling: scrollSpeed > 2, // Быстрый скролл (более 2 пикселей/мс)
    isSlowScrolling: scrollSpeed > 0 && scrollSpeed <= 0.5, // Медленный скролл
  };
};

export default useScrollDetection;
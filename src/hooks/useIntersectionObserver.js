import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Хук для отслеживания видимости элемента с помощью Intersection Observer
 * Оптимизирует производительность, отключая hover эффекты для невидимых элементов
 * @param {Object} options - Опции для Intersection Observer
 * @param {number} options.threshold - Порог видимости (0-1)
 * @param {string} options.rootMargin - Отступы от viewport
 * @param {boolean} options.freezeOnceVisible - Останавливать наблюдение после первого появления
 * @returns {Object} - { ref, isIntersecting, isVisible }
 */
export const useIntersectionObserver = ({
  threshold = 0.1,
  rootMargin = '50px',
  freezeOnceVisible = false
} = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const observerRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    const [entry] = entries;
    const isCurrentlyIntersecting = entry.isIntersecting;
    
    setIsIntersecting(isCurrentlyIntersecting);
    
    if (isCurrentlyIntersecting) {
      setIsVisible(true);
      
      // Если нужно остановить наблюдение после первого появления
      if (freezeOnceVisible && observerRef.current && elementRef.current) {
        observerRef.current.unobserve(elementRef.current);
      }
    } else {
      // Элемент не видим, но мы помним, что он был видим ранее
      if (!freezeOnceVisible) {
        setIsVisible(false);
      }
    }
  }, [freezeOnceVisible]);

  useEffect(() => {
    const element = elementRef.current;
    
    if (!element) return;

    // Создаем observer только если его еще нет
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold,
        rootMargin,
      });
    }

    // Начинаем наблюдение
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleIntersection, threshold, rootMargin]);

  // Cleanup при размонтировании
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    ref: elementRef,
    isIntersecting,
    isVisible,
    // Дополнительные утилиты
    shouldEnableHover: isIntersecting && isVisible,
  };
};

/**
 * Хук для массового отслеживания видимости элементов
 * Оптимизирован для виртуальных списков
 * @param {Array} items - Массив элементов для отслеживания
 * @param {Object} options - Опции для Intersection Observer
 * @returns {Object} - { getRef, isVisible, visibleItems }
 */
export const useBulkIntersectionObserver = (items = [], options = {}) => {
  const [visibleItems, setVisibleItems] = useState(new Set());
  const refsMap = useRef(new Map());
  const observerRef = useRef(null);

  const handleIntersection = useCallback((entries) => {
    setVisibleItems(prev => {
      const newVisible = new Set(prev);
      
      entries.forEach(entry => {
        const itemId = entry.target.dataset.itemId;
        if (entry.isIntersecting) {
          newVisible.add(itemId);
        } else {
          newVisible.delete(itemId);
        }
      });
      
      return newVisible;
    });
  }, []);

  useEffect(() => {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(handleIntersection, {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      });
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, options]);

  const getRef = useCallback((itemId) => {
    if (!refsMap.current.has(itemId)) {
      refsMap.current.set(itemId, {
        current: null,
        observe: (element) => {
          if (element && observerRef.current) {
            element.dataset.itemId = itemId;
            observerRef.current.observe(element);
          }
        },
        unobserve: (element) => {
          if (element && observerRef.current) {
            observerRef.current.unobserve(element);
          }
        }
      });
    }
    return refsMap.current.get(itemId);
  }, []);

  const isVisible = useCallback((itemId) => {
    return visibleItems.has(itemId);
  }, [visibleItems]);

  return {
    getRef,
    isVisible,
    visibleItems,
    visibleCount: visibleItems.size,
  };
};

export default useIntersectionObserver;
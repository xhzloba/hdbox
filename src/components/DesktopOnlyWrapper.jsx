import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';

const DesktopOnlyWrapper = ({ children }) => {
  const [isDesktop, setIsDesktop] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsDesktop(width >= 1024); // 1024px и больше считается десктопом
      setIsLoading(false);
    };

    // Проверяем размер экрана при загрузке
    checkScreenSize();

    // Добавляем слушатель изменения размера окна
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Показываем загрузку пока определяем размер экрана
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Если не десктоп, показываем страницу ограничения
  if (!isDesktop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Иконки устройств */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30">
              <Smartphone className="w-8 h-8 text-red-400" />
            </div>
            <div className="p-3 rounded-full bg-red-500/20 border border-red-500/30">
              <Tablet className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-2xl text-gray-500 mx-2">→</div>
            <div className="p-3 rounded-full bg-green-500/20 border border-green-500/30">
              <Monitor className="w-8 h-8 text-green-400" />
            </div>
          </div>

          {/* Основное сообщение */}
          <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-8 border border-gray-700/50 shadow-2xl">
            <div className="mb-6">
              <Monitor className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">
                Только Desktop версия
              </h1>
              <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
            </div>

            <p className="text-gray-300 text-lg mb-6 leading-relaxed">
              Данный сайт поддерживается только на Desktop устройствах для обеспечения наилучшего пользовательского опыта.
            </p>

            <div className="bg-gray-700/30 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm">
                <strong className="text-white">Рекомендация:</strong><br />
                Откройте сайт на компьютере или ноутбуке с разрешением экрана не менее 1024px
              </p>
            </div>

            {/* Дополнительная информация */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>Минимальное разрешение: 1024px</p>
              <p>Текущее разрешение: {window.innerWidth}px</p>
            </div>
          </div>

          {/* Декоративные элементы */}
          <div className="mt-8 flex justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Если десктоп, показываем обычный контент
  return children;
};

export default DesktopOnlyWrapper;

"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { ParentalControlProvider } from "../contexts/ParentalControlContext";

import { SettingsProvider } from "../contexts/SettingsContext";
import FlyingPoster from "./FlyingPoster";
import { Toaster } from "@/components/ui/toaster";

// Функция getInitialTheme больше не нужна, next-themes управляет темой автоматически

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchAnimating, setIsSearchAnimating] = useState(false);

  const toggleSidebar = useCallback(() => {
    try {
      if (typeof document !== "undefined") {
        (document.documentElement as any).dataset.sidebarAnimating = "true";
        setTimeout(() => {
          try {
            if (typeof document !== "undefined") {
              delete (document.documentElement as any).dataset.sidebarAnimating;
              // уведомим слушателей, что лэйаут устаканился
              window.dispatchEvent(new Event("resize"));
            }
          } catch {}
        }, 350); // совпадает с transition duration-300 + небольшой запас
      }
    } catch {}
    setSidebarOpen((prev) => !prev);
  }, []);



  const handleSearchFocus = useCallback((isActive: boolean) => {
    if (isActive) {
      // При активации сначала показываем оверлей, потом делаем его видимым
      setIsSearchActive(true);
      setTimeout(() => {
        setIsSearchAnimating(true);
        // Не блокируем прокрутку страницы, так как scrollbar-gutter: stable в CSS
        // решает проблему смещения контента
        if (typeof document !== "undefined") {
          (document.documentElement as any).dataset.searchActive = "true";
        }
      }, 10); // Небольшая задержка для корректной анимации
    } else {
      // При деактивации сначала убираем видимость, потом скрываем оверлей
      setIsSearchAnimating(false);
      setTimeout(() => {
        setIsSearchActive(false);
        // Не разблокируем прокрутку, так как она всегда доступна из-за overflow-y: scroll
        if (typeof document !== "undefined") {
          delete (document.documentElement as any).dataset.searchActive;
        }
      }, 300); // Ждем окончания анимации
    }
  }, []);

  const handleOverlayClick = () => {
    // Убираем фокус с поля поиска если оно есть
    const searchInput = document.querySelector(
      'input[placeholder*="Поиск"]'
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.blur();
    }
    // Логика деактивации будет вызвана через handleSearchFocus
  };

  // Этот useEffect больше не нужен, так как next-themes управляет темой автоматически

  // Сброс позиции скролла при загрузке страницы
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <SettingsProvider>
        <ParentalControlProvider>
          <FavoritesProvider>
            <div className="min-h-screen bg-background">
              <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

              <div
                className={`flex flex-col min-h-screen transition-all duration-300 ${
                  sidebarOpen ? "lg:ml-60" : "lg:ml-16"
                }`}
              >
                <Header
                  toggleSidebar={toggleSidebar}
                  onSearchFocus={handleSearchFocus}
                  isSearchActive={isSearchActive}
                  isSearchAnimating={isSearchAnimating}
                />
                <main className="flex-1">{children}</main>
              </div>

              <FlyingPoster />
              <Toaster />

              {/* Глобальный оверлей для затемнения всей страницы при поиске */}
              {isSearchActive && (
                <div
                  className={`fixed inset-0 bg-black/70 z-[60] transition-opacity duration-300 ${
                    isSearchAnimating ? "opacity-100" : "opacity-0"
                  }`}
                  style={{ willChange: "opacity", transform: "translateZ(0)" }}
                  onClick={handleOverlayClick}
                />
              )}
            </div>
          </FavoritesProvider>
        </ParentalControlProvider>
    </SettingsProvider>
  );
}

"use client";
import { Home, Tv, Heart, X, Info, Baby } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavorites } from "../contexts/FavoritesContext";
import { useSettings } from "../contexts/SettingsContext";
import FuzzyText from "./ui/shadcn-io/fuzzy-text";

const FilmIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="currentColor"
    height="48"
    viewBox="0 0 48 48"
    width="48"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      clipRule="evenodd"
      d="M42 24C42 31.2328 38.3435 37.6115 32.7782 41.3886C33.1935 41.2738 33.602 41.1447 34 41C45.1693 36.9384 47 32 47 32L48 35C48 35 44.3832 40.459 34.5 43.5C28 45.5 21 45 21 45C9.40202 45 0 35.598 0 24C0 12.402 9.40202 3 21 3C32.598 3 42 12.402 42 24ZM21 19C24.3137 19 27 16.3137 27 13C27 9.68629 24.3137 7 21 7C17.6863 7 15 9.68629 15 13C15 16.3137 17.6863 19 21 19ZM10 30C13.3137 30 16 27.3137 16 24C16 20.6863 13.3137 18 10 18C6.68629 18 4 20.6863 4 24C4 27.3137 6.68629 30 10 30ZM38 24C38 27.3137 35.3137 30 32 30C28.6863 30 26 27.3137 26 24C26 20.6863 28.6863 18 32 18C35.3137 18 38 20.6863 38 24ZM21 26C22.1046 26 23 25.1046 23 24C23 22.8954 22.1046 22 21 22C19.8954 22 19 22.8954 19 24C19 25.1046 19.8954 26 21 26ZM27 35C27 38.3137 24.3137 41 21 41C17.6863 41 15 38.3137 15 35C15 31.6863 17.6863 29 21 29C24.3137 29 27 31.6863 27 35Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

const QualityIcon = ({ className }) => (
  <svg
    aria-hidden="true"
    className={className}
    fill="currentColor"
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v6h10V5H5z"
      clipRule="evenodd"
    />
    <path d="M2 6a1 1 0 011-1h1v2H3a1 1 0 01-1-1zM2 10a1 1 0 011-1h1v2H3a1 1 0 01-1-1zM16 6a1 1 0 001-1V4a1 1 0 00-1-1h-1v2h1zM16 10a1 1 0 001-1V8a1 1 0 00-1-1h-1v2h1zM7 15a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
    <rect x="6" y="6" width="2" height="2" rx="0.5" />
    <rect x="9" y="6" width="2" height="2" rx="0.5" />
    <rect x="12" y="6" width="2" height="2" rx="0.5" />
    <rect x="6" y="9" width="2" height="2" rx="0.5" />
    <rect x="9" y="9" width="2" height="2" rx="0.5" />
    <rect x="12" y="9" width="2" height="2" rx="0.5" />
  </svg>
);



import { useState } from "react";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const { getFavoritesCount } = useFavorites();
  const { sidebarShadowsEnabled } = useSettings();



  // Синхронно читаем настройки из localStorage для предотвращения мерцания
  const getSavedShadowsSetting = () => {
    // Проверяем, что мы находимся в браузере (не SSR)
    if (typeof window === "undefined") {
      return true; // По умолчанию включены при SSR
    }

    try {
      const savedSettings = localStorage.getItem("movieCardSettings");
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return settings.sidebarShadowsEnabled ?? true;
      }
    } catch (error) {
      console.error("Ошибка чтения настроек:", error);
    }
    return true; // По умолчанию включены
  };

  // Используем синхронное чтение настроек или fallback из контекста
  const shadowsEnabled = sidebarShadowsEnabled ?? getSavedShadowsSetting();

  // Обычный режим
  const normalMenuItems = [
    { icon: Home, label: "Главная", id: "home", path: "/" },
    {
      icon: Tv,
      label: "Сейчас смотрят",
      id: "watching-now",
      path: "/watching-now",
    },
    {
      icon: QualityIcon,
      label: "4K HD HDR",
      id: "quality",
      path: "/quality",
    },
    { icon: FilmIcon, label: "Фильмы", id: "movies", path: "/movies" },
    { icon: Tv, label: "Сериалы", id: "series", path: "/series" },
    { icon: Baby, label: "Мультфильмы", id: "cartoons", path: "/cartoons" },
    {
      icon: Heart,
      label: "Избранное",
      id: "favorites",
      path: "/favorites",
      count: getFavoritesCount(),
    },
  ];

  const menuItems = normalMenuItems;

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed left-0 top-0 h-full bg-sidebar/95 backdrop-blur-sm border-r border-sidebar-border z-50
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-56 lg:w-60" : "w-0 lg:w-16"}
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${!isOpen ? "lg:block hidden" : "block"}
      `}
        style={{
          userSelect: "none",
          ...(shadowsEnabled && {
            borderBottomRightRadius: "50px",
            borderTopRightRadius: "50px",
            background: "linear-gradient(145deg, #151515, #191919)",
            boxShadow: "18px 18px 13px #101010, -18px -18px 13px #1e1e1e",
          }),
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-center p-6 border-b border-sidebar-border ${
            !isOpen ? "lg:p-3" : ""
          }`}
        >
          {isOpen ? (
            <div
              className="text-xl font-bold text-sidebar-foreground"
              style={{
                userSelect: "none",
                height: "40px",
                minHeight: "40px",
                display: "flex",
                alignItems: "center",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  ...(shadowsEnabled && {
                    filter:
                      "drop-shadow(0 0 8px rgb(46, 45, 51)) drop-shadow(0 0 16px rgba(100, 149, 237, 0.3))",
                    textShadow:
                      "0 0 6px rgb(99, 98, 99), 0 0 12px rgba(107, 108, 109, 0.4)",
                  }),
                  height: "40px",
                  lineHeight: "40px",
                }}
              >
                <FuzzyText
                  fontSize={38}
                  fontWeight={700}
                  color="#ffffff"
                  enableHover={true}
                  baseIntensity={0.2}
                  hoverIntensity={0.8}
                >
                  HDBOX
                </FuzzyText>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center mx-auto">
                <span
                  className="text-sm font-bold text-sidebar-primary-foreground"
                  style={{ userSelect: "none" }}
                >
                  S
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`p-4 ${!isOpen ? "lg:p-2" : ""}`}>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg 
                      transition-all duration-200 group
                      ${!isOpen ? "lg:px-2 lg:justify-center" : ""}
                      ${
                        isActive
                          ? "text-white"
                          : "text-gray-300 hover:text-white"
                      }
                    `}
                    title={!isOpen ? item.label : ""}
                    data-menu-id={item.id}
                    style={{
                      userSelect: "none",
                      background:
                        "linear-gradient(131deg, rgb(25, 25, 25), rgb(36, 35, 35))",
                      boxShadow:
                        "rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) 2px 2px 20px inset",
                      borderTop: isActive
                        ? "1px solid transparent"
                        : "1px solid #545454",
                      ...(isActive &&
                        isOpen && {
                          userSelect: "none",
                          background:
                            "linear-gradient(45deg, rgb(0, 123, 255), rgb(13, 27, 37))",
                          boxShadow:
                            "rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) -20px 12px 20px inset",
                          borderTop: "1px solid transparent",
                        }),
                      ...(isActive && item.id === "cartoons" && {
                        userSelect: "none",
                        background: "linear-gradient(45deg, rgb(255, 0, 200), rgb(13, 27, 37))",
                        boxShadow: "rgb(0, 0, 0) 7px 5px 8px, rgb(48, 49, 50) -20px 12px 20px inset",
                        borderTop: "1px solid transparent",
                      }),
                      ...(isActive &&
                        !isOpen && {
                          background:
                            "linear-gradient(131deg, rgb(0, 49, 243), rgb(36, 8, 255))",
                          boxShadow:
                            "rgb(0, 0, 0) 7px 5px 8px, rgb(57, 92, 255) 2px 2px 20px inset",
                          borderTop: "1px solid transparent",
                        }),
                    }}
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                    {isOpen && (
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span
                          className="font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-shrink-0"
                          style={{ userSelect: "none" }}
                        >
                          {item.label}
                        </span>
                        {item.count !== undefined && item.count > 0 && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full min-w-[20px] text-center ${
                              isActive
                                ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                                : "bg-sidebar-primary text-sidebar-primary-foreground"
                            }`}
                            style={{ userSelect: "none" }}
                          >
                            {item.count}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>


      </div>


    </>
  );
};

export default Sidebar;

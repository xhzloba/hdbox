"use client";
import { Home, Film, Tv, Heart, X, Info } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavorites } from "../contexts/FavoritesContext";
import { useSettings } from "../contexts/SettingsContext";
import FuzzyText from "./ui/shadcn-io/fuzzy-text";

import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { changelogData } from "../data/changelog";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const pathname = usePathname();
  const { getFavoritesCount } = useFavorites();
  const { sidebarShadowsEnabled } = useSettings();
  const [showChangelog, setShowChangelog] = useState(false);

  // Синхронно читаем настройки из localStorage для предотвращения мерцания
  const getSavedShadowsSetting = () => {
    try {
      const savedSettings = localStorage.getItem('movieCardSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        return settings.sidebarShadowsEnabled ?? true;
      }
    } catch (error) {
      console.error('Ошибка чтения настроек:', error);
    }
    return true; // По умолчанию включены
  };

  // Используем синхронное чтение настроек или fallback из контекста
  const shadowsEnabled = sidebarShadowsEnabled ?? getSavedShadowsSetting();

  // Обычный режим
  const normalMenuItems = [
    { icon: Home, label: "Главная", id: "home", path: "/" },
    { icon: Film, label: "Фильмы", id: "movies", path: "/movies" },
    { icon: Tv, label: "Сериалы", id: "series", path: "/series" },
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
          userSelect: 'none', 
          ...(shadowsEnabled && { 
            borderBottomRightRadius: '50px',
            borderTopRightRadius: '50px',
            background: 'linear-gradient(145deg, #151515, #191919)',
            boxShadow: '18px 18px 13px #101010, -18px -18px 13px #1e1e1e'
          })
        }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-center p-6 border-b border-sidebar-border ${
            !isOpen ? "lg:p-3" : ""
          }`}
        >
          {isOpen ? (
            <div className="text-xl font-bold text-sidebar-foreground" style={{ userSelect: 'none', height: '40px', minHeight: '40px', display: 'flex', alignItems: 'center', marginTop: '8px' }}>
              <div style={{
                ...(shadowsEnabled && {
                  filter: 'drop-shadow(0 0 8px rgb(46, 45, 51)) drop-shadow(0 0 16px rgba(100, 149, 237, 0.3))',
                  textShadow: '0 0 6px rgb(99, 98, 99), 0 0 12px rgba(107, 108, 109, 0.4)'
                }),
                height: '40px',
                lineHeight: '40px'
              }}>
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
                <span className="text-sm font-bold text-sidebar-primary-foreground" style={{ userSelect: 'none' }}>
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
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                      }
                    `}
                    title={!isOpen ? item.label : ""}
                    data-menu-id={item.id}
                    style={{ userSelect: 'none' }}
                  >
                    <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform flex-shrink-0" />
                    {isOpen && (
                      <div className="flex items-center justify-between w-full">
                        <span className="font-medium" style={{ userSelect: 'none' }}>{item.label}</span>
                        {item.count !== undefined && item.count > 0 && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full min-w-[20px] text-center ${
                              isActive
                                ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                                : "bg-sidebar-primary text-sidebar-primary-foreground"
                            }`}
                            style={{ userSelect: 'none' }}
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

        {/* Version Section */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border" style={{ userSelect: 'none' }}>
            <button
              onClick={() => setShowChangelog(true)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50 hover:bg-sidebar-accent transition-colors" 
              style={{ userSelect: 'none' }}
            >
              <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                <Info className="w-4 h-4 text-sidebar-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0 text-left" style={{ userSelect: 'none' }}>
                <p className="text-sm font-medium text-blue-500 truncate" style={{ userSelect: 'none' }}>
                  Версия 2.1
                </p>
                <p className="text-xs text-muted-foreground" style={{ userSelect: 'none' }}>Нажмите для changelog</p>
              </div>
            </button>
          </div>
        )}

      </div>
      
      {/* Changelog Dialog */}
      <AlertDialog open={showChangelog} onOpenChange={setShowChangelog}>
        <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <AlertDialogHeader>
            <AlertDialogTitle>История изменений</AlertDialogTitle>
            <AlertDialogCancel className="absolute right-4 top-4 p-2 rounded-lg hover:bg-accent transition-colors">
              <X className="w-4 h-4" />
            </AlertDialogCancel>
          </AlertDialogHeader>
          <div className="p-4 overflow-y-auto max-h-[60vh]">
            <div className="space-y-6">
              {changelogData.map((release) => (
                <div key={release.version} className="border-b border-border pb-4 last:border-b-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">
                      Версия {release.version}
                    </h3>
                    <span className="text-sm text-muted-foreground">
                      {release.date}
                    </span>
                  </div>
                  <h4 className="text-md font-medium text-primary mb-2">
                    {release.title}
                  </h4>
                  <ul className="space-y-1">
                    {release.changes.map((change, index) => (
                      <li key={index} className="text-sm text-muted-foreground" style={{textIndent: '1rem', paddingLeft: '1rem'}}>
                        <span className="text-primary" style={{marginLeft: '-1rem', marginRight: '0.5rem'}}>-</span>
                        {change}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sidebar;

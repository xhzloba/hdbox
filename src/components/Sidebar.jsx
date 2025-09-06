"use client";
import { Home, Sparkles, Film, Tv, Heart, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFavorites } from "../contexts/FavoritesContext";
import { useKids } from "../contexts/KidsContext";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { getFavoritesCount } = useFavorites();
  const { isKidsMode } = useKids();
  const pathname = usePathname();

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

  // Kids режим
  const kidsMenuItems = [
    { icon: Home, label: "Главная", id: "home", path: "/" },
    {
      icon: Sparkles,
      label: "Популярное",
      id: "popular",
      path: "/kids/popular",
    },
    {
      icon: Film,
      label: "Мультфильмы",
      id: "cartoons",
      path: "/kids/cartoons",
    },
    {
      icon: Tv,
      label: "Мультсериалы",
      id: "cartoon-series",
      path: "/kids/cartoon-series",
    },
    {
      icon: Heart,
      label: "Избранное",
      id: "favorites",
      path: "/favorites",
      count: getFavoritesCount(),
    },
  ];

  const menuItems = isKidsMode ? kidsMenuItems : normalMenuItems;

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
        style={{ userSelect: 'none' }}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b border-sidebar-border ${
            !isOpen ? "lg:p-3" : ""
          }`}
        >
          {isOpen ? (
            <>
              <h1 className="text-xl font-bold text-sidebar-foreground" style={{ userSelect: 'none' }}>
                Stream<span className="text-sidebar-primary" style={{ userSelect: 'none' }}>Flix</span>
              </h1>
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors lg:hidden"
              >
                <X className="w-5 h-5 text-sidebar-foreground" />
              </button>
            </>
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
                          ? isKidsMode
                            ? "bg-pink-500 text-white"
                            : "bg-sidebar-primary text-sidebar-primary-foreground"
                          : isKidsMode
                          ? "text-sidebar-foreground hover:bg-pink-100 hover:text-pink-600"
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
                              isActive && isKidsMode
                                ? "bg-white text-pink-500"
                                : isActive
                                ? "bg-sidebar-primary-foreground/20 text-sidebar-primary-foreground"
                                : isKidsMode
                                ? "bg-pink-500 text-white"
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

        {/* User Profile Section */}
        {isOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border" style={{ userSelect: 'none' }}>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent/50" style={{ userSelect: 'none' }}>
              <div className="w-8 h-8 bg-sidebar-primary rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-sidebar-primary-foreground" style={{ userSelect: 'none' }}>
                  У
                </span>
              </div>
              <div className="flex-1 min-w-0" style={{ userSelect: 'none' }}>
                <p className="text-sm font-medium text-sidebar-foreground truncate" style={{ userSelect: 'none' }}>
                  Пользователь
                </p>
                <p className="text-xs text-muted-foreground" style={{ userSelect: 'none' }}>Премиум аккаунт</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;

"use client"
import { useState, useEffect } from "react"
import { Play, Plus, Info } from "lucide-react"
import { useFavorites } from "../../../src/contexts/FavoritesContext"

const KidsCartoonSeriesPage = () => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [cartoonSeries, setCartoonSeries] = useState([])

  useEffect(() => {
    // Симуляция загрузки мультсериалов
    const mockCartoonSeries = [
      {
        id: "series-1",
        title: "Гравити Фолз",
        description: "Близнецы Диппер и Мэйбл проводят лето у своего двоюродного дедушки в загадочном городке Гравити Фолз, полном тайн и мистических существ.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Gravity%20Falls%20animated%20series%20poster%20with%20Dipper%20Mabel%20mysterious%20forest%20town&image_size=portrait_4_3",
        year: 2012,
        rating: "12+",
        seasons: 2,
        episodes: 40,
        type: "series"
      },
      {
        id: "series-2",
        title: "Время приключений",
        description: "Мальчик Финн и его лучший друг пёс Джейк путешествуют по постапокалиптической Земле Ууу, встречая странных персонажей и переживая невероятные приключения.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Adventure%20Time%20animated%20series%20poster%20with%20Finn%20Jake%20colorful%20fantasy%20world&image_size=portrait_4_3",
        year: 2010,
        rating: "12+",
        seasons: 10,
        episodes: 283,
        type: "series"
      },
      {
        id: "series-3",
        title: "Вселенная Стивена",
        description: "Стивен Юнивёрс - мальчик-полугем, который живёт с магическими существами Кристальными самоцветами и учится использовать свои способности.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Steven%20Universe%20animated%20series%20poster%20with%20Steven%20Crystal%20Gems%20magical%20adventure&image_size=portrait_4_3",
        year: 2013,
        rating: "6+",
        seasons: 5,
        episodes: 160,
        type: "series"
      },
      {
        id: "series-4",
        title: "Аватар: Легенда об Аанге",
        description: "Юный Аанг должен овладеть всеми четырьмя стихиями, чтобы остановить Народ Огня и восстановить баланс в мире.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Avatar%20Last%20Airbender%20animated%20series%20poster%20with%20Aang%20four%20elements%20bending&image_size=portrait_4_3",
        year: 2005,
        rating: "6+",
        seasons: 3,
        episodes: 61,
        type: "series"
      },
      {
        id: "series-5",
        title: "Удивительный мир Гамбола",
        description: "Гамбол Уоттерсон - синий кот, который вместе со своим приёмным братом рыбкой Дарвином попадает в самые невероятные ситуации.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Amazing%20World%20of%20Gumball%20animated%20series%20poster%20with%20blue%20cat%20Gumball%20Darwin%20fish&image_size=portrait_4_3",
        year: 2011,
        rating: "6+",
        seasons: 6,
        episodes: 240,
        type: "series"
      },
      {
        id: "series-6",
        title: "Мы обычные медведи",
        description: "Три брата-медведя - Гризли, Панда и Белый медведь - пытаются вписаться в современный мир и найти своё место среди людей.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=We%20Bare%20Bears%20animated%20series%20poster%20with%20three%20bears%20Grizzly%20Panda%20Ice%20Bear&image_size=portrait_4_3",
        year: 2015,
        rating: "6+",
        seasons: 4,
        episodes: 140,
        type: "series"
      }
    ]
    setCartoonSeries(mockCartoonSeries)
  }, [])

  const handleToggleFavorite = (item) => {
    if (isFavorite(item.id)) {
      removeFromFavorites(item.id)
    } else {
      addToFavorites(item)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-indigo-600/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              Мультсериалы
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Захватывающие мультсериалы с любимыми персонажами
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cartoonSeries.map((item) => (
            <div key={item.id} className="group relative bg-card rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Series Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                    {item.seasons} сезон{item.seasons > 1 ? (item.seasons < 5 ? 'а' : 'ов') : ''}
                  </span>
                </div>
                
                {/* Action Buttons */}
                <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="flex-1 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    Смотреть
                  </button>
                  <button 
                    onClick={() => handleToggleFavorite(item)}
                    className={`p-2 rounded-lg transition-colors ${
                      isFavorite(item.id) 
                        ? "bg-pink-500 text-white" 
                        : "bg-white/20 text-white hover:bg-white/30"
                    }`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors">
                    <Info className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{item.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{item.year}</span>
                  <span>{item.rating}</span>
                  <span>{item.episodes} эп.</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KidsCartoonSeriesPage
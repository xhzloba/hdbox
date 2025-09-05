"use client"
import { useState, useEffect } from "react"
import { Play, Plus, Info } from "lucide-react"
import { useFavorites } from "../../../src/contexts/FavoritesContext"

const KidsCartoonsPage = () => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [cartoons, setCartoons] = useState([])

  useEffect(() => {
    // Симуляция загрузки мультфильмов
    const mockCartoons = [
      {
        id: "cartoon-1",
        title: "Тайная жизнь домашних животных",
        description: "Что делают наши питомцы, когда мы уходим из дома? Оказывается, они живут своей тайной жизнью!",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Secret%20Life%20of%20Pets%20animated%20movie%20poster%20with%20cute%20dogs%20and%20cats%20in%20apartment&image_size=portrait_4_3",
        year: 2016,
        rating: "6+",
        duration: "87 мин",
        type: "movie"
      },
      {
        id: "cartoon-2",
        title: "Корпорация монстров",
        description: "В мире монстров компания 'Корпорация монстров' добывает энергию из детских криков. Но всё меняется, когда в их мир попадает маленькая девочка.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Monsters%20Inc%20Pixar%20movie%20poster%20with%20Sulley%20and%20Mike%20colorful%20monsters&image_size=portrait_4_3",
        year: 2001,
        rating: "0+",
        duration: "92 мин",
        type: "movie"
      },
      {
        id: "cartoon-3",
        title: "В поисках Немо",
        description: "Рыба-клоун Марлин отправляется через весь океан на поиски своего сына Немо, который попал в аквариум к людям.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Finding%20Nemo%20Pixar%20movie%20poster%20with%20clownfish%20underwater%20ocean%20adventure&image_size=portrait_4_3",
        year: 2003,
        rating: "0+",
        duration: "100 мин",
        type: "movie"
      },
      {
        id: "cartoon-4",
        title: "Шрек",
        description: "Зелёный огр Шрек живёт в болоте и не любит гостей. Но однажды ему приходится спасать принцессу, чтобы вернуть свой дом.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Shrek%20animated%20movie%20poster%20with%20green%20ogre%20and%20fairy%20tale%20characters&image_size=portrait_4_3",
        year: 2001,
        rating: "6+",
        duration: "90 мин",
        type: "movie"
      },
      {
        id: "cartoon-5",
        title: "Головоломка",
        description: "Заглянем в голову 11-летней Райли и познакомимся с её эмоциями: Радостью, Грустью, Гневом, Страхом и Брезгливостью.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Inside%20Out%20Pixar%20movie%20poster%20with%20colorful%20emotions%20characters%20Joy%20Sadness&image_size=portrait_4_3",
        year: 2015,
        rating: "6+",
        duration: "95 мин",
        type: "movie"
      },
      {
        id: "cartoon-6",
        title: "Тачки",
        description: "Молния Маккуин - гоночная машина, которая мечтает выиграть Кубок Поршня. Но иногда важнее найти настоящих друзей.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Cars%20Pixar%20movie%20poster%20with%20Lightning%20McQueen%20racing%20car%20on%20racetrack&image_size=portrait_4_3",
        year: 2006,
        rating: "0+",
        duration: "117 мин",
        type: "movie"
      }
    ]
    setCartoons(mockCartoons)
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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-green-600/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              Мультфильмы
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Лучшие полнометражные мультфильмы для всей семьи
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cartoons.map((item) => (
            <div key={item.id} className="group relative bg-card rounded-lg overflow-hidden hover:scale-105 transition-transform duration-300">
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
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
                  <span>{item.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KidsCartoonsPage
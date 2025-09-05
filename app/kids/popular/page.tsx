"use client"
import { useState, useEffect } from "react"
import { Play, Plus, Info } from "lucide-react"
import { useFavorites } from "../../../src/contexts/FavoritesContext"

const KidsPopularPage = () => {
  const { addToFavorites, removeFromFavorites, isFavorite } = useFavorites()
  const [popularContent, setPopularContent] = useState([])

  useEffect(() => {
    // Симуляция загрузки популярного детского контента
    const mockPopularContent = [
      {
        id: "kids-1",
        title: "Холодное сердце 2",
        description: "Эльза, Анна, Кристофф и Олаф отправляются далеко за пределы королевства Эренделл, чтобы найти ответы на вопросы о прошлом.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Frozen%202%20movie%20poster%20with%20Elsa%20and%20Anna%20in%20magical%20winter%20landscape&image_size=portrait_4_3",
        year: 2019,
        rating: "6+",
        duration: "103 мин",
        type: "movie"
      },
      {
        id: "kids-2",
        title: "Моана",
        description: "Отважная дочь вождя полинезийского племени отправляется в опасное путешествие через океан, чтобы спасти свой народ.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Moana%20Disney%20movie%20poster%20with%20ocean%20and%20tropical%20island%20adventure&image_size=portrait_4_3",
        year: 2016,
        rating: "6+",
        duration: "107 мин",
        type: "movie"
      },
      {
        id: "kids-3",
        title: "Зверополис",
        description: "В городе, где живут самые разные животные, кролик-полицейский и лис-мошенник объединяются, чтобы раскрыть заговор.",
        image: "https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Zootopia%20animated%20movie%20poster%20with%20rabbit%20police%20officer%20and%20fox%20in%20animal%20city&image_size=portrait_4_3",
        year: 2016,
        rating: "6+",
        duration: "108 мин",
        type: "movie"
      }
    ]
    setPopularContent(mockPopularContent)
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
        <div className="absolute inset-0 bg-gradient-to-r from-pink-600/90 to-purple-600/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        <div className="relative z-10 flex items-center justify-center h-full text-center px-4">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-white">
              Популярное для детей
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto">
              Самые любимые мультфильмы и мультсериалы
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularContent.map((item) => (
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

export default KidsPopularPage
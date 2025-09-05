import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCardSkeleton from './MovieCardSkeleton'

const MovieSliderSkeleton = ({ title = "Популярное сейчас", showTabs = false }) => {
  // Скелетон табов
  const tabsSkeleton = showTabs ? (
    <div className="bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]">
      <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium bg-background shadow animate-pulse">
        <div className="h-4 w-24 bg-muted-foreground/20 rounded"></div>
      </div>
      <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium animate-pulse">
        <div className="h-4 w-16 bg-muted-foreground/20 rounded"></div>
      </div>
      <div className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium animate-pulse">
        <div className="h-4 w-16 bg-muted-foreground/20 rounded"></div>
      </div>
    </div>
  ) : null
  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {tabsSkeleton}
          {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 rounded-full border border-border opacity-50 cursor-not-allowed bg-muted"
            disabled
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            className="p-2 rounded-full border border-border opacity-50 cursor-not-allowed bg-muted"
            disabled
            aria-label="Следующий слайд"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="w-[120px] md:w-[200px] min-w-[120px] md:min-w-[200px] max-w-[120px] md:max-w-[200px] flex-shrink-0 min-w-0"
            >
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MovieSliderSkeleton
/**
 * Валидирует и очищает URL изображения
 * @param {string} url - URL для проверки
 * @returns {string|null} - валидный URL или null
 */
const validateImageUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  // Проверяем на некорректные значения
  const invalidPatterns = [
    "httpsundefined",
    "httpundefined",
    "undefined",
    "null",
    "placeholder",
    "no-image",
  ];

  const urlLower = url.toLowerCase();
  if (invalidPatterns.some((pattern) => urlLower.includes(pattern))) {
    console.log("🚫 Некорректный URL изображения:", url);
    return null;
  }

  // Проверяем, что URL начинается с http:// или https://
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    console.log("🚫 URL не начинается с http/https:", url);
    return null;
  }

  // Проверяем минимальную длину URL
  if (url.length < 10) {
    console.log("🚫 URL слишком короткий:", url);
    return null;
  }

  return url;
};

/**
 * Рассчитывает общий рейтинг на основе доступных рейтингов
 * @param {string|number} rating_kp - рейтинг КиноПоиска
 * @param {string|number} rating_imdb - рейтинг IMDB
 * @param {string|number} tmdb_rating - рейтинг TMDB
 * @returns {Object} - объект с рейтингом и флагом отображения
 */
const calculateRating = (rating_kp, rating_imdb, tmdb_rating) => {
  // Преобразуем все рейтинги в числа
  const kp = parseFloat(rating_kp) || 0;
  const imdb = parseFloat(rating_imdb) || 0;
  const tmdb = parseFloat(tmdb_rating) || 0;

  // Собираем все ненулевые рейтинги
  const validRatings = [kp, imdb, tmdb].filter((rating) => rating > 0);

  // Если нет валидных рейтингов - не показываем
  if (validRatings.length === 0) {
    return {
      rating: null,
      showRating: false,
    };
  }

  // Если только один рейтинг - показываем его
  if (validRatings.length === 1) {
    return {
      rating: validRatings[0].toFixed(1),
      showRating: true,
    };
  }

  // Если несколько рейтингов - рассчитываем средний
  const averageRating =
    validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length;

  return {
    rating: averageRating.toFixed(1),
    showRating: true,
  };
};

/**
 * Трансформирует данные фильма из API в формат приложения
 * @param {Object} apiMovie - данные фильма из API
 * @returns {Object} - трансформированные данные
 */
export const transformMovieData = (apiMovie) => {
  const details = apiMovie.details;

  // Валидируем URL изображений
  const posterUrl = validateImageUrl(details.poster);
  const backdropUrl = validateImageUrl(
    details.bg_poster?.backdrop || details.wide_poster
  );

  // Логируем проблемные случаи для отладки
  if (!posterUrl && details.poster) {
    console.log(
      "⚠️ Проблемный poster URL для фильма:",
      details.name,
      "URL:",
      details.poster
    );
  }
  if (!backdropUrl && (details.bg_poster?.backdrop || details.wide_poster)) {
    console.log(
      "⚠️ Проблемный backdrop URL для фильма:",
      details.name,
      "URL:",
      details.bg_poster?.backdrop || details.wide_poster
    );
  }

  // Рассчитываем рейтинг на основе всех доступных источников
  const ratingData = calculateRating(
    details.rating_kp,
    details.rating_imdb,
    details.tmdb_rating
  );

  // Сохраняем все жанры без ограничений
  let processedGenre;
  if (Array.isArray(details.genre)) {
    processedGenre = details.genre;
  } else if (typeof details.genre === "string") {
    processedGenre = details.genre.split(",").map((g) => g.trim());
  } else {
    processedGenre = details.genre;
  }

  return {
    id: details.id,
    ident: apiMovie.ident, // Добавляем ident для работы с плеерами
    title: details.name,
    originalTitle: details.originalname,
    poster: posterUrl,
    backdrop: backdropUrl,
    rating: ratingData.rating,
    showRating: ratingData.showRating,
    year: details.released,
    genre: processedGenre,
    description: details.about,
    duration: details.duration,
    country: details.country,
    director: details.director,
    type: details.type,
    tags: details.tags || [],
    playlistUrl: apiMovie.playlist_url,
    age: details.age || null, // Возрастное ограничение из API
  };
};

/**
 * Трансформирует массив фильмов из API
 * @param {Array} apiMovies - массив фильмов из API
 * @returns {Array} - трансформированный массив
 */
export const transformMoviesArray = (apiMovies) => {
  // Проверяем, что apiMovies является массивом
  if (!Array.isArray(apiMovies)) {
    console.warn(
      "transformMoviesArray: получен не массив:",
      typeof apiMovies,
      apiMovies
    );
    return [];
  }

  return apiMovies.map(transformMovieData);
};

/**
 * Безопасно извлекает и трансформирует каналы из ответа API
 * @param {Object} apiResponse - ответ от API
 * @param {string} source - источник данных для логирования
 * @returns {Array} - трансформированный массив или пустой массив
 */
export const safeTransformApiResponse = (apiResponse, source = "unknown") => {
  // Проверяем структуру ответа
  if (!apiResponse) {
    console.warn(
      `safeTransformApiResponse (${source}): получен null/undefined ответ`
    );
    return [];
  }

  if (!apiResponse.channels) {
    console.warn(
      `safeTransformApiResponse (${source}): отсутствует поле channels в ответе:`,
      apiResponse
    );
    return [];
  }

  // Используем transformMoviesArray которая уже имеет свою проверку
  return transformMoviesArray(apiResponse.channels);
};

/**
 * Фильтрует фильмы по типу
 * @param {Array} movies - массив фильмов
 * @param {string} type - тип контента ('movie', 'tv', 'multfilm')
 * @returns {Array} - отфильтрованный массив
 */
export const filterMoviesByType = (movies, type) => {
  return movies.filter((movie) => movie.type === type);
};

/**
 * Проверяет валидность URL изображения
 * @param {string} imageUrl - URL изображения
 * @returns {boolean} - true если изображение валидно
 */
const isValidImageUrl = (imageUrl) => {
  if (
    !imageUrl ||
    imageUrl === "" ||
    imageUrl === null ||
    imageUrl === undefined
  ) {
    return false;
  }

  // Проверяем на некорректные значения
  const invalidPatterns = [
    "httpsundefined",
    "httpundefined",
    "/placeholder",
    "placeholder.",
    "undefined",
    "null",
    "no-image",
  ];

  const urlLower = imageUrl.toLowerCase();
  if (invalidPatterns.some((pattern) => urlLower.includes(pattern))) {
    return false;
  }

  // Проверяем, что URL начинается с http:// или https://
  if (!imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
    return false;
  }

  // Проверяем минимальную длину URL
  if (imageUrl.length < 10) {
    return false;
  }

  return true;
};

/**
 * Получает случайный фильм для hero секции
 * Фильтрует фильмы без изображений перед выбором
 * @param {Array} movies - массив фильмов
 * @returns {Object|null} - случайный фильм с изображением или null
 */
export const getRandomFeaturedMovie = (movies) => {
  if (!movies || movies.length === 0) return null;

  // Фильтруем фильмы, у которых есть хотя бы одно валидное изображение
  const moviesWithImages = movies
    .slice(0, 10) // Берем первые 10 фильмов
    .filter((movie) => {
      // Проверяем наличие валидного backdrop или poster
      const hasValidBackdrop = isValidImageUrl(movie.backdrop);
      const hasValidPoster = isValidImageUrl(movie.poster);

      // Возвращаем фильм, если есть хотя бы одно валидное изображение
      return hasValidBackdrop || hasValidPoster;
    });

  // Если после фильтрации не осталось подходящих фильмов, возвращаем null
  if (moviesWithImages.length === 0) {
    console.log(
      "⚠️ getRandomFeaturedMovie: Нет фильмов с валидными изображениями в первых 10"
    );
    return null;
  }

  // Выбираем случайный фильм из отфильтрованного списка
  const randomIndex = Math.floor(Math.random() * moviesWithImages.length);
  const selectedMovie = moviesWithImages[randomIndex];

  console.log("🎲 getRandomFeaturedMovie: Выбран фильм", {
    title: selectedMovie.title,
    backdrop: selectedMovie.backdrop,
    poster: selectedMovie.poster,
  });

  return selectedMovie;
};

"use client";

import { useState, useEffect } from "react";
import MovieSlider from "./MovieSlider";
// Убираем импорт TabsList и TabsTrigger, так как используем кастомные табы в MovieSlider

import VokinoAPI from "../services/api";
import {
  transformMoviesArray,
  safeTransformApiResponse,
} from "../utils/dataTransformers";
import { useKids } from "../contexts/KidsContext";

const MainContent = ({ sidebarOpen }) => {
  const { isKidsMode } = useKids();
  const [popularMovies, setPopularMovies] = useState([]);
  const [newMovies, setNewMovies] = useState([]);
  const [popularMoviesOnly, setPopularMoviesOnly] = useState([]);
  const [popularSeriesOnly, setPopularSeriesOnly] = useState([]);
  const [watchingMovies, setWatchingMovies] = useState([]);
  const [activeTab, setActiveTab] = useState("watching");

  // Состояния для слайдера "Новинки" с табами
  const [updatingsMovies, setUpdatingsMovies] = useState([]);
  const [newMoviesTab, setNewMoviesTab] = useState("new");

  // Состояния для слайдера мультфильмов
  const [cartoonsUpdatings, setCartoonsUpdatings] = useState([]);
  const [cartoonsNew, setCartoonsNew] = useState([]);
  const [cartoonsPopular, setCartoonsPopular] = useState([]);
  const [cartoonsRating, setCartoonsRating] = useState([]);
  const [cartoonsActiveTab, setCartoonsActiveTab] = useState("updatings");

  // Состояния для слайдера мультсериалов
  const [cartoonSeriesUpdatings, setCartoonSeriesUpdatings] = useState([]);
  const [cartoonSeriesNew, setCartoonSeriesNew] = useState([]);
  const [cartoonSeriesPopular, setCartoonSeriesPopular] = useState([]);
  const [cartoonSeriesRating, setCartoonSeriesRating] = useState([]);
  const [cartoonSeriesActiveTab, setCartoonSeriesActiveTab] =
    useState("updatings");

  const [error, setError] = useState(null);
  const [tabLoading, setTabLoading] = useState(false);
  const [tabLoadingNew, setTabLoadingNew] = useState(false);
  const [tabLoadingCartoons, setTabLoadingCartoons] = useState(false);
  const [tabLoadingCartoonSeries, setTabLoadingCartoonSeries] = useState(false);

  // Состояния для отслеживания загрузки основных данных
  const [isLoadingPopular, setIsLoadingPopular] = useState(true);
  const [isLoadingNew, setIsLoadingNew] = useState(true);
  const [isLoadingUpdatings, setIsLoadingUpdatings] = useState(true);
  const [isLoadingWatching, setIsLoadingWatching] = useState(true);
  const [isLoadingCartoons, setIsLoadingCartoons] = useState(true);
  const [isLoadingCartoonSeries, setIsLoadingCartoonSeries] = useState(true);

  // Состояния для отслеживания изначальных данных (для индикации новых поступлений)
  const [initialNewMovies, setInitialNewMovies] = useState([]);
  const [initialUpdatingsMovies, setInitialUpdatingsMovies] = useState([]);

  // Состояния индикаторов новых поступлений
  const [hasNewInNewTab, setHasNewInNewTab] = useState(false);
  const [hasNewInUpdatingsTab, setHasNewInUpdatingsTab] = useState(false);

  // Состояния для визуального выделения новых фильмов
  const [visuallyHighlightedMovies, setVisuallyHighlightedMovies] = useState(
    []
  );

  // Состояния для таймеров автосброса индикаторов
  const [newTabTimer, setNewTabTimer] = useState(null);
  const [updatingsTabTimer, setUpdatingsTabTimer] = useState(null);

  // Ключи для localStorage
  const STORAGE_KEYS = {
    INITIAL_NEW_MOVIES: "vokino_initial_new_movies",
    INITIAL_UPDATINGS_MOVIES: "vokino_initial_updatings_movies",
    STORAGE_TIMESTAMP: "vokino_storage_timestamp",
    VIEWED_NEW_CONTENT: "vokino_viewed_new_content",
    VIEWED_UPDATINGS_CONTENT: "vokino_viewed_updatings_content",
  };

  // Функции для работы с localStorage
  const saveInitialDataToStorage = (newMovies, updatingsMovies) => {
    try {
      const timestamp = Date.now();
      localStorage.setItem(
        STORAGE_KEYS.INITIAL_NEW_MOVIES,
        JSON.stringify(newMovies)
      );
      localStorage.setItem(
        STORAGE_KEYS.INITIAL_UPDATINGS_MOVIES,
        JSON.stringify(updatingsMovies)
      );
      localStorage.setItem(
        STORAGE_KEYS.STORAGE_TIMESTAMP,
        timestamp.toString()
      );
    } catch (err) {
      console.error("Ошибка сохранения данных в localStorage:", err);
    }
  };

  const loadInitialDataFromStorage = () => {
    try {
      const timestamp = localStorage.getItem(STORAGE_KEYS.STORAGE_TIMESTAMP);

      // Проверяем, не устарели ли данные (24 часа)
      if (timestamp) {
        const now = Date.now();
        const storedTime = parseInt(timestamp);
        const hoursPassed = (now - storedTime) / (1000 * 60 * 60);

        if (hoursPassed > 24) {
          // Данные устарели, очищаем localStorage
          clearInitialDataFromStorage();
          return { newMovies: null, updatingsMovies: null };
        }
      }

      const newMovies = localStorage.getItem(STORAGE_KEYS.INITIAL_NEW_MOVIES);
      const updatingsMovies = localStorage.getItem(
        STORAGE_KEYS.INITIAL_UPDATINGS_MOVIES
      );

      return {
        newMovies: newMovies ? JSON.parse(newMovies) : null,
        updatingsMovies: updatingsMovies ? JSON.parse(updatingsMovies) : null,
      };
    } catch (err) {
      console.error("Ошибка загрузки данных из localStorage:", err);
      return { newMovies: null, updatingsMovies: null };
    }
  };

  const clearInitialDataFromStorage = () => {
    try {
      localStorage.removeItem(STORAGE_KEYS.INITIAL_NEW_MOVIES);
      localStorage.removeItem(STORAGE_KEYS.INITIAL_UPDATINGS_MOVIES);
      localStorage.removeItem(STORAGE_KEYS.STORAGE_TIMESTAMP);
    } catch (err) {
      console.error("Ошибка очистки localStorage:", err);
    }
  };

  // Функции для сравнения данных и выявления новых элементов
  const compareMoviesArrays = (
    currentMovies,
    initialMovies,
    tabValue = null
  ) => {
    if (initialMovies.length === 0) return false;

    // Сравниваем по ID фильмов
    const initialIds = new Set(initialMovies.map((movie) => movie.id));
    const newMovies = currentMovies.filter(
      (movie) => !initialIds.has(movie.id)
    );

    // Если есть новые фильмы, проверяем не были ли они уже просмотрены
    if (newMovies.length > 0 && tabValue) {
      const viewedIds = new Set(getViewedContent(tabValue));
      const unseenNewMovies = newMovies.filter(
        (movie) => !viewedIds.has(movie.id)
      );
      return unseenNewMovies.length > 0;
    }

    return newMovies.length > 0;
  };

  const checkForNewContent = () => {
    // Проверяем новинки
    if (newMovies.length > 0 && initialNewMovies.length > 0) {
      const hasNewInNew = compareMoviesArrays(newMovies, initialNewMovies);
      setHasNewInNewTab(hasNewInNew);
    }

    // Проверяем обновления
    if (updatingsMovies.length > 0 && initialUpdatingsMovies.length > 0) {
      const hasNewInUpdatings = compareMoviesArrays(
        updatingsMovies,
        initialUpdatingsMovies
      );
      setHasNewInUpdatingsTab(hasNewInUpdatings);
    }
  };

  // Функции для работы с просмотренным контентом
  const saveViewedContent = (tabValue, contentIds) => {
    try {
      const key =
        tabValue === "new"
          ? STORAGE_KEYS.VIEWED_NEW_CONTENT
          : STORAGE_KEYS.VIEWED_UPDATINGS_CONTENT;
      localStorage.setItem(
        key,
        JSON.stringify({
          ids: contentIds,
          timestamp: Date.now(),
        })
      );
    } catch (err) {
      console.error("Ошибка сохранения просмотренного контента:", err);
    }
  };

  const getViewedContent = (tabValue) => {
    try {
      const key =
        tabValue === "new"
          ? STORAGE_KEYS.VIEWED_NEW_CONTENT
          : STORAGE_KEYS.VIEWED_UPDATINGS_CONTENT;
      const stored = localStorage.getItem(key);
      if (stored) {
        const data = JSON.parse(stored);
        // Проверяем, не устарели ли данные (24 часа)
        const hoursPassed = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        if (hoursPassed < 24) {
          return data.ids || [];
        }
      }
      return [];
    } catch (err) {
      console.error("Ошибка загрузки просмотренного контента:", err);
      return [];
    }
  };

  // Функция для автоматического сброса индикатора через 30 секунд
  const startAutoResetTimer = (tabValue) => {
    // Очищаем предыдущий таймер если есть
    if (tabValue === "new" && newTabTimer) {
      clearTimeout(newTabTimer);
    } else if (tabValue === "updatings" && updatingsTabTimer) {
      clearTimeout(updatingsTabTimer);
    }

    // Запускаем новый таймер
    const timer = setTimeout(() => {
      if (tabValue === "new") {
        setHasNewInNewTab(false);
        // Сбрасываем визуальное выделение
        setVisuallyHighlightedMovies([]);
        // Сохраняем информацию о просмотре
        const currentContent = newMovies.map((movie) => movie.id);
        saveViewedContent("new", currentContent);
        setNewTabTimer(null);
      } else if (tabValue === "updatings") {
        setHasNewInUpdatingsTab(false);
        // Сбрасываем визуальное выделение
        setVisuallyHighlightedMovies([]);
        // Сохраняем информацию о просмотре
        const currentContent = updatingsMovies.map((movie) => movie.id);
        saveViewedContent("updatings", currentContent);
        setUpdatingsTabTimer(null);
      }
    }, 30000); // 30 секунд

    // Сохраняем ссылку на таймер
    if (tabValue === "new") {
      setNewTabTimer(timer);
    } else if (tabValue === "updatings") {
      setUpdatingsTabTimer(timer);
    }
  };

  // Функция для сброса индикаторов при переключении табов
  const resetNewIndicator = (tabValue) => {
    if (tabValue === "new") {
      setHasNewInNewTab(false);
    } else if (tabValue === "updatings") {
      setHasNewInUpdatingsTab(false);
    }
  };

  // Функция для полного сброса изначальных данных (например, по требованию пользователя)
  const resetInitialData = () => {
    clearInitialDataFromStorage();
    setInitialNewMovies([]);
    setInitialUpdatingsMovies([]);
    setHasNewInNewTab(false);
    setHasNewInUpdatingsTab(false);

    // Перезагружаем данные и устанавливаем их как новые изначальные
    Promise.all([VokinoAPI.getNew(1), VokinoAPI.getUpdatings(1)])
      .then(([newResponse, updatingsResponse]) => {
        const newMovies = transformMoviesArray(newResponse.channels);
        const updatingsMovies = transformMoviesArray(
          updatingsResponse.channels
        );

        setInitialNewMovies(newMovies);
        setInitialUpdatingsMovies(updatingsMovies);
        saveInitialDataToStorage(newMovies, updatingsMovies);
      })
      .catch((err) => {
        console.error("Ошибка при сбросе изначальных данных:", err);
      });
  };

  // Функция для загрузки популярных фильмов
  const loadPopularMovies = async () => {
    if (popularMoviesOnly.length > 0) return; // Уже загружены

    try {
      setTabLoading(true);
      const response = await VokinoAPI.getPopularMovies(1);
      const transformedMovies = transformMoviesArray(response.channels);
      setPopularMoviesOnly(transformedMovies);
    } catch (err) {
      console.error("Ошибка загрузки популярных фильмов:", err);
    } finally {
      setTabLoading(false);
    }
  };

  // Функция для загрузки контента "Сейчас смотрят"
  const loadWatchingMovies = async () => {
    if (watchingMovies.length > 0) return; // Уже загружены

    try {
      setTabLoading(true);
      const response = await VokinoAPI.getWatching(1);
      const transformedMovies = transformMoviesArray(response.channels);
      setWatchingMovies(transformedMovies);
    } catch (err) {
      console.error("Ошибка загрузки контента 'Сейчас смотрят':", err);
    } finally {
      setTabLoading(false);
    }
  };

  // Функция для загрузки популярных сериалов
  const loadPopularSeries = async () => {
    if (popularSeriesOnly.length > 0) return; // Уже загружены

    try {
      setTabLoading(true);
      const response = await VokinoAPI.getPopularSeries(1);
      const transformedSeries = transformMoviesArray(response.channels);
      setPopularSeriesOnly(transformedSeries);
    } catch (err) {
      console.error("Ошибка загрузки популярных сериалов:", err);
    } finally {
      setTabLoading(false);
    }
  };

  // Функция для загрузки обновлений
  const loadUpdatings = async () => {
    if (updatingsMovies.length > 0) return; // Уже загружены

    try {
      setTabLoadingNew(true);
      const response = await VokinoAPI.getUpdatings(1);
      const transformedUpdatings = transformMoviesArray(response.channels);
      setUpdatingsMovies(transformedUpdatings);
    } catch (err) {
      console.error("Ошибка загрузки обновлений:", err);
    } finally {
      setTabLoadingNew(false);
    }
  };

  // Функции для загрузки мультфильмов
  const loadCartoonsUpdatings = async () => {
    if (cartoonsUpdatings.length > 0) return Promise.resolve(); // Уже загружены

    try {
      setTabLoadingCartoons(true);
      const response = await VokinoAPI.getCartoonsUpdatings(1);
      const transformedCartoons = safeTransformApiResponse(
        response,
        "cartoons-updatings"
      );
      setCartoonsUpdatings(transformedCartoons);
      return Promise.resolve();
    } catch (err) {
      console.error("Ошибка загрузки обновлений мультфильмов:", err);
      setCartoonsUpdatings([]);
      return Promise.reject(err);
    } finally {
      setTabLoadingCartoons(false);
    }
  };

  const loadCartoonsNew = async () => {
    if (cartoonsNew.length > 0) return; // Уже загружены

    try {
      setTabLoadingCartoons(true);
      const response = await VokinoAPI.getCartoonsNew(1);
      const transformedCartoons = safeTransformApiResponse(
        response,
        "cartoons-new"
      );
      setCartoonsNew(transformedCartoons);
    } catch (err) {
      console.error("Ошибка загрузки новых мультфильмов:", err);
    } finally {
      setTabLoadingCartoons(false);
    }
  };

  const loadCartoonsPopular = async () => {
    if (cartoonsPopular.length > 0) return; // Уже загружены

    try {
      setTabLoadingCartoons(true);
      const response = await VokinoAPI.getCartoonsPopular(1);
      const transformedCartoons = safeTransformApiResponse(
        response,
        "cartoons-popular"
      );
      setCartoonsPopular(transformedCartoons);
    } catch (err) {
      console.error("Ошибка загрузки популярных мультфильмов:", err);
    } finally {
      setTabLoadingCartoons(false);
    }
  };

  const loadCartoonsRating = async () => {
    if (cartoonsRating.length > 0) return; // Уже загружены

    try {
      setTabLoadingCartoons(true);
      const response = await VokinoAPI.getCartoonsRating(1);
      const transformedCartoons = safeTransformApiResponse(
        response,
        "cartoons-rating"
      );
      setCartoonsRating(transformedCartoons);
    } catch (err) {
      console.error("Ошибка загрузки лучших мультфильмов:", err);
    } finally {
      setTabLoadingCartoons(false);
    }
  };

  // Функции для загрузки мультсериалов
  const loadCartoonSeriesUpdatings = async () => {
    if (cartoonSeriesUpdatings.length > 0) return Promise.resolve(); // Уже загружены

    try {
      setTabLoadingCartoonSeries(true);
      const response = await VokinoAPI.getCartoonSeriesUpdatings(1);
      const transformedCartoonSeries = safeTransformApiResponse(
        response,
        "cartoon-series-updatings"
      );
      setCartoonSeriesUpdatings(transformedCartoonSeries);
      return Promise.resolve();
    } catch (err) {
      console.error("Ошибка загрузки обновлений мультсериалов:", err);
      return Promise.reject(err);
    } finally {
      setTabLoadingCartoonSeries(false);
    }
  };

  const loadCartoonSeriesNew = async () => {
    if (cartoonSeriesNew.length > 0) return; // Уже загружены

    try {
      setTabLoadingCartoonSeries(true);
      const response = await VokinoAPI.getCartoonSeriesNew(1);
      const transformedCartoonSeries = transformMoviesArray(response.channels);
      setCartoonSeriesNew(transformedCartoonSeries);
    } catch (err) {
      console.error("Ошибка загрузки новых мультсериалов:", err);
    } finally {
      setTabLoadingCartoonSeries(false);
    }
  };

  const loadCartoonSeriesPopular = async () => {
    if (cartoonSeriesPopular.length > 0) return; // Уже загружены

    try {
      setTabLoadingCartoonSeries(true);
      const response = await VokinoAPI.getCartoonSeriesPopular(1);
      const transformedCartoonSeries = transformMoviesArray(response.channels);
      setCartoonSeriesPopular(transformedCartoonSeries);
    } catch (err) {
      console.error("Ошибка загрузки популярных мультсериалов:", err);
    } finally {
      setTabLoadingCartoonSeries(false);
    }
  };

  const loadCartoonSeriesRating = async () => {
    if (cartoonSeriesRating.length > 0) return; // Уже загружены

    try {
      setTabLoadingCartoonSeries(true);
      const response = await VokinoAPI.getCartoonSeriesRating(1);
      const transformedCartoonSeries = transformMoviesArray(response.channels);
      setCartoonSeriesRating(transformedCartoonSeries);
    } catch (err) {
      console.error("Ошибка загрузки лучших мультсериалов:", err);
    } finally {
      setTabLoadingCartoonSeries(false);
    }
  };

  // Обработчик смены вкладки
  const handleTabChange = (value) => {
    setActiveTab(value);
    if (value === "movies") {
      loadPopularMovies();
    } else if (value === "series") {
      loadPopularSeries();
    } else if (value === "watching") {
      loadWatchingMovies();
    }
  };

  // Обработчик смены вкладки для слайдера "Новинки"
  const handleNewTabChange = (value) => {
    setNewMoviesTab(value);

    // Сбрасываем предыдущее визуальное выделение при смене вкладки
    setVisuallyHighlightedMovies([]);

    // Запускаем таймер автосброса если переключились на таб с активным индикатором
    if (
      (value === "new" && hasNewInNewTab) ||
      (value === "updatings" && hasNewInUpdatingsTab)
    ) {
      startAutoResetTimer(value);
    }

    if (value === "updatings") {
      loadUpdatings();
    }
  };

  // Обработчик смены вкладки для мультфильмов
  const handleCartoonsTabChange = (value) => {
    setCartoonsActiveTab(value);
    if (value === "updatings") {
      loadCartoonsUpdatings();
    } else if (value === "new") {
      loadCartoonsNew();
    } else if (value === "popular") {
      loadCartoonsPopular();
    } else if (value === "rating") {
      loadCartoonsRating();
    }
  };

  // Обработчик смены вкладки для мультсериалов
  const handleCartoonSeriesTabChange = (value) => {
    setCartoonSeriesActiveTab(value);
    if (value === "updatings") {
      loadCartoonSeriesUpdatings();
    } else if (value === "new") {
      loadCartoonSeriesNew();
    } else if (value === "popular") {
      loadCartoonSeriesPopular();
    } else if (value === "rating") {
      loadCartoonSeriesRating();
    }
  };

  // Получение текущих фильмов на основе активной вкладки
  const getCurrentMovies = () => {
    switch (activeTab) {
      case "watching":
        return watchingMovies.slice(0, 18);
      case "popular":
        return popularMovies.slice(0, 18);
      case "movies":
        return popularMoviesOnly.slice(0, 18);
      case "series":
        return popularSeriesOnly.slice(0, 18);
      default:
        return watchingMovies.slice(0, 18);
    }
  };

  // Проверка загрузки для текущей вкладки
  const isCurrentTabLoading = () => {
    if (activeTab === "watching") {
      return isLoadingWatching || tabLoading || watchingMovies.length === 0;
    }
    if (activeTab === "movies") {
      return tabLoading || popularMoviesOnly.length === 0;
    }
    if (activeTab === "series") {
      return tabLoading || popularSeriesOnly.length === 0;
    }
    return false;
  };

  // Получение текущих фильмов для слайдера "Новинки" на основе активной вкладки
  const getCurrentNewMovies = () => {
    switch (newMoviesTab) {
      case "new":
        return newMovies.slice(0, 18);
      case "updatings":
        return updatingsMovies.slice(0, 18);
      default:
        return [];
    }
  };

  // Получение ID новых фильмов для слайдера "Новинки"
  const getNewMoviesIdsForNewTab = () => {
    // Если визуальное выделение уже сброшено, возвращаем пустой массив
    if (visuallyHighlightedMovies.length === 0) {
      const currentMovies = getCurrentNewMovies();
      if (currentMovies.length === 0) return [];

      let initialData = [];
      if (newMoviesTab === "new" && initialNewMovies.length > 0) {
        initialData = initialNewMovies;
      } else if (
        newMoviesTab === "updatings" &&
        initialUpdatingsMovies.length > 0
      ) {
        initialData = initialUpdatingsMovies;
      }

      if (initialData.length === 0) return [];

      // Используем ту же логику что и для красной точки
      const hasNewContent = compareMoviesArrays(
        currentMovies,
        initialData,
        newMoviesTab
      );
      if (!hasNewContent) return [];

      const initialIds = new Set(initialData.map((movie) => movie.id));
      const newMoviesInTab = currentMovies.filter(
        (movie) => !initialIds.has(movie.id)
      );

      const viewedIds = new Set(getViewedContent(newMoviesTab));

      const newMovieIds = newMoviesInTab
        .filter((movie) => !viewedIds.has(movie.id))
        .map((movie) => movie.id);

      // Устанавливаем визуально выделенные фильмы
      if (newMovieIds.length > 0) {
        setVisuallyHighlightedMovies(newMovieIds);
      }

      return newMovieIds;
    }

    // Возвращаем уже установленные выделенные фильмы
    return visuallyHighlightedMovies;
  };

  // Проверка загрузки для текущей вкладки слайдера "Новинки"
  const isCurrentNewTabLoading = () => {
    if (newMoviesTab === "updatings") {
      return (
        isLoadingUpdatings || tabLoadingNew || updatingsMovies.length === 0
      );
    }
    if (newMoviesTab === "new") {
      return isLoadingNew || newMovies.length === 0;
    }
    return false;
  };

  // Получение текущих мультфильмов на основе активной вкладки
  const getCurrentCartoons = () => {
    switch (cartoonsActiveTab) {
      case "updatings":
        return cartoonsUpdatings.slice(0, 18);
      case "new":
        return cartoonsNew.slice(0, 18);
      case "popular":
        return cartoonsPopular.slice(0, 18);
      case "rating":
        return cartoonsRating.slice(0, 18);
      default:
        return [];
    }
  };

  // Проверка загрузки для текущей вкладки мультфильмов
  const isCurrentCartoonsTabLoading = () => {
    if (cartoonsActiveTab === "updatings") {
      return tabLoadingCartoons || cartoonsUpdatings.length === 0;
    }
    if (cartoonsActiveTab === "new") {
      return tabLoadingCartoons || cartoonsNew.length === 0;
    }
    if (cartoonsActiveTab === "popular") {
      return tabLoadingCartoons || cartoonsPopular.length === 0;
    }
    if (cartoonsActiveTab === "rating") {
      return tabLoadingCartoons || cartoonsRating.length === 0;
    }
    return false;
  };

  // Получение текущих мультсериалов на основе активной вкладки
  const getCurrentCartoonSeries = () => {
    switch (cartoonSeriesActiveTab) {
      case "updatings":
        return cartoonSeriesUpdatings.slice(0, 18);
      case "new":
        return cartoonSeriesNew.slice(0, 18);
      case "popular":
        return cartoonSeriesPopular.slice(0, 18);
      case "rating":
        return cartoonSeriesRating.slice(0, 18);
      default:
        return [];
    }
  };

  // Проверка загрузки для текущей вкладки мультсериалов
  const isCurrentCartoonSeriesTabLoading = () => {
    if (cartoonSeriesActiveTab === "updatings") {
      return tabLoadingCartoonSeries || cartoonSeriesUpdatings.length === 0;
    }
    if (cartoonSeriesActiveTab === "new") {
      return tabLoadingCartoonSeries || cartoonSeriesNew.length === 0;
    }
    if (cartoonSeriesActiveTab === "popular") {
      return tabLoadingCartoonSeries || cartoonSeriesPopular.length === 0;
    }
    if (cartoonSeriesActiveTab === "rating") {
      return tabLoadingCartoonSeries || cartoonSeriesRating.length === 0;
    }
    return false;
  };

  useEffect(() => {
    // Загружаем только основные данные для немедленного отображения
    const loadInitialContent = async () => {
      try {
        setError(null);

        // Проверяем localStorage на наличие сохраненных изначальных данных
        const storedData = loadInitialDataFromStorage();

        // Загружаем популярные фильмы, новинки и "Сейчас смотрят" параллельно, но неблокирующе
        Promise.all([
          VokinoAPI.getPopular(1).then((response) => {
            const transformedPopularMovies = transformMoviesArray(
              response.channels
            );
            setPopularMovies(transformedPopularMovies);
            setIsLoadingPopular(false);
          }),
          VokinoAPI.getWatching(1).then((response) => {
            const transformedWatchingMovies = transformMoviesArray(
              response.channels
            );
            setWatchingMovies(transformedWatchingMovies);
            setIsLoadingWatching(false);
          }),
          VokinoAPI.getNew(1).then((response) => {
            const transformedNewMovies = transformMoviesArray(
              response.channels
            );
            setNewMovies(transformedNewMovies);

            // Устанавливаем изначальные данные для новинок
            if (storedData.newMovies) {
              // Используем сохраненные данные для сравнения
              setInitialNewMovies(storedData.newMovies);
              // Проверяем, есть ли новые фильмы (учитываем просмотренные)
              if (
                compareMoviesArrays(
                  transformedNewMovies,
                  storedData.newMovies,
                  "new"
                )
              ) {
                setHasNewInNewTab(true);
              }
            } else {
              // Сохраняем текущие данные как изначальные
              setInitialNewMovies(transformedNewMovies);
            }

            setIsLoadingNew(false);
          }),
          VokinoAPI.getUpdatings(1)
            .then((response) => {
              const transformedUpdatings = transformMoviesArray(
                response.channels
              );
              setUpdatingsMovies(transformedUpdatings);

              // Устанавливаем изначальные данные для обновлений
              if (storedData.updatingsMovies) {
                // Используем сохраненные данные для сравнения
                setInitialUpdatingsMovies(storedData.updatingsMovies);
                // Проверяем, есть ли новые обновления (учитываем просмотренные)
                if (
                  compareMoviesArrays(
                    transformedUpdatings,
                    storedData.updatingsMovies,
                    "updatings"
                  )
                ) {
                  setHasNewInUpdatingsTab(true);
                }
              } else {
                // Сохраняем текущие данные как изначальные
                setInitialUpdatingsMovies(transformedUpdatings);
              }

              setIsLoadingUpdatings(false);
            })
            .catch((err) => {
              console.error(
                "Ошибка загрузки обновлений при инициализации:",
                err
              );
              setIsLoadingUpdatings(false);
            }),
        ])
          .then(() => {
            // После загрузки всех данных, сохраняем изначальные данные в localStorage
            // только если их там не было
            if (!storedData.newMovies || !storedData.updatingsMovies) {
              // Получаем актуальные данные из состояния
              VokinoAPI.getNew(1).then((newResponse) => {
                const newMovies = transformMoviesArray(newResponse.channels);
                VokinoAPI.getUpdatings(1).then((updatingsResponse) => {
                  const updatingsMovies = transformMoviesArray(
                    updatingsResponse.channels
                  );
                  saveInitialDataToStorage(
                    storedData.newMovies || newMovies,
                    storedData.updatingsMovies || updatingsMovies
                  );
                });
              });
            }
          })
          .catch((err) => {
            console.error("Ошибка загрузки основного контента:", err);
            setError("Не удалось загрузить контент");
            setIsLoadingPopular(false);
            setIsLoadingNew(false);
            setIsLoadingUpdatings(false);
          });
      } catch (err) {
        console.error("Ошибка инициализации:", err);
        setError("Не удалось загрузить контент");
        setIsLoadingPopular(false);
        setIsLoadingNew(false);
        setIsLoadingUpdatings(false);
      }
    };

    loadInitialContent();
  }, []);

  // Загружаем данные для Kids режима лениво при переключении
  useEffect(() => {
    if (isKidsMode) {
      // Загружаем мультфильмы только при входе в Kids режим
      if (cartoonsUpdatings.length === 0) {
        loadCartoonsUpdatings().then(() => setIsLoadingCartoons(false));
      } else {
        setIsLoadingCartoons(false);
      }
      // Загружаем мультсериалы только при входе в Kids режим
      if (cartoonSeriesUpdatings.length === 0) {
        loadCartoonSeriesUpdatings().then(() =>
          setIsLoadingCartoonSeries(false)
        );
      } else {
        setIsLoadingCartoonSeries(false);
      }
    }
  }, [isKidsMode]);

  // Периодическая проверка новых данных
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      try {
        // Проверяем новинки (учитываем просмотренные)
        const newResponse = await VokinoAPI.getNew(1);
        const transformedNewMovies = transformMoviesArray(newResponse.channels);
        if (
          compareMoviesArrays(transformedNewMovies, initialNewMovies, "new")
        ) {
          setNewMovies(transformedNewMovies);
          setHasNewInNewTab(true);
        }

        // Проверяем обновления (учитываем просмотренные)
        const updatingsResponse = await VokinoAPI.getUpdatings(1);
        const transformedUpdatings = transformMoviesArray(
          updatingsResponse.channels
        );
        if (
          compareMoviesArrays(
            transformedUpdatings,
            initialUpdatingsMovies,
            "updatings"
          )
        ) {
          setUpdatingsMovies(transformedUpdatings);
          setHasNewInUpdatingsTab(true);
        }
      } catch (err) {
        console.error("Ошибка при проверке новых данных:", err);
      }
    }, 3600000); // Проверяем каждый час

    return () => clearInterval(checkInterval);
  }, [initialNewMovies, initialUpdatingsMovies]);

  // Очистка таймеров при размонтировании компонента
  useEffect(() => {
    return () => {
      if (newTabTimer) {
        clearTimeout(newTabTimer);
      }
      if (updatingsTabTimer) {
        clearTimeout(updatingsTabTimer);
      }
    };
  }, [newTabTimer, updatingsTabTimer]);

  if (error) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-primary/80 text-primary-foreground px-6 py-2 rounded-lg"
          >
            Попробовать снова
          </button>
        </div>
      </main>
    );
  }

  // Табы теперь создаются внутри MovieSlider как кастомные кнопки

  return (
    <main className="flex-1 bg-background">
      {/* Content Sections */}
      <div className="px-6 lg:px-12 py-8 space-y-12 bg-background">
        <div key={isKidsMode ? "kids" : "normal"}>
          {isKidsMode ? (
            /* Kids режим - слайдеры мультфильмов и мультсериалов */
            <div className="space-y-12">
              <MovieSlider
                movies={getCurrentCartoons()}
                title=""
                tabs={true}
                activeTab={cartoonsActiveTab}
                onTabChange={handleCartoonsTabChange}
                isLoading={isLoadingCartoons || isCurrentCartoonsTabLoading()}
                sectionTitle="Мультфильмы"
                sidebarOpen={sidebarOpen}
                tabsConfig={[
                  { value: "updatings", label: "Обновления" },
                  { value: "new", label: "Новинки" },
                  { value: "popular", label: "Популярное" },
                  { value: "rating", label: "Лучшее" },
                ]}
              />

              <MovieSlider
                movies={getCurrentCartoonSeries()}
                title=""
                tabs={true}
                activeTab={cartoonSeriesActiveTab}
                onTabChange={handleCartoonSeriesTabChange}
                isLoading={
                  isLoadingCartoonSeries || isCurrentCartoonSeriesTabLoading()
                }
                sectionTitle="Мультсериалы"
                sidebarOpen={sidebarOpen}
                tabsConfig={[
                  { value: "updatings", label: "Обновления" },
                  { value: "new", label: "Новинки" },
                  { value: "popular", label: "Популярное" },
                  { value: "rating", label: "Лучшее" },
                ]}
              />
            </div>
          ) : (
            /* Обычный режим - слайдеры фильмов и сериалов */
            <div className="space-y-12">
              {/* Слайдер с табами */}
              <MovieSlider
                movies={getCurrentMovies()}
                title=""
                tabs={true}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isLoading={isLoadingPopular || isCurrentTabLoading()}
                sidebarOpen={sidebarOpen}
                showContentTypeBadge={true}
              />

              {/* Слайдер "Новинки" с табами */}
              <MovieSlider
                movies={getCurrentNewMovies()}
                title=""
                tabs={true}
                activeTab={newMoviesTab}
                onTabChange={handleNewTabChange}
                isLoading={isCurrentNewTabLoading()}
                sidebarOpen={sidebarOpen}
                newIndicators={{
                  new: hasNewInNewTab,
                  updatings: hasNewInUpdatingsTab,
                }}
                tabsConfig={[
                  { value: "new", label: "Новинки" },
                  { value: "updatings", label: "Обновления" },
                ]}
                newMovies={getNewMoviesIdsForNewTab()}
                showContentTypeBadge={true}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default MainContent;

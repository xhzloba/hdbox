const API_BASE_URL = "https://api.vokino.tv/v2";

class VokinoAPI {
  /**
   * Получить популярные фильмы и сериалы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getPopular(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=popular&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении популярных фильмов:", error);
      throw error;
    }
  }

  /**
   * Получить новинки
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getNew(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=new&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении новинок:", error);
      throw error;
    }
  }

  /**
   * Получить фильмы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getMovies(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?type=movie&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении фильмов:", error);
      throw error;
    }
  }

  /**
   * Получить сериалы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getSeries(page = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/list?type=tv&page=${page}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении сериалов:", error);
      throw error;
    }
  }

  /**
   * Получить популярные фильмы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getPopularMovies(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=popular&page=${page}&type=movie`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении популярных фильмов:", error);
      throw error;
    }
  }

  /**
   * Получить популярные сериалы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getPopularSeries(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=popular&page=${page}&type=serial`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении популярных сериалов:", error);
      throw error;
    }
  }

  /**
   * Получить обновления
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getUpdatings(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=updatings&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении обновлений:", error);
      throw error;
    }
  }

  /**
   * Получить обновления мультфильмов
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getCartoonsUpdatings(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=updatings&type=multfilm&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении обновлений мультфильмов:", error);
      throw error;
    }
  }

  /**
   * Получить новые мультфильмы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getCartoonsNew(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=new&type=multfilm&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении новых мультфильмов:", error);
      throw error;
    }
  }

  /**
   * Получить популярные мультфильмы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getCartoonsPopular(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=popular&type=multfilm&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении популярных мультфильмов:", error);
      throw error;
    }
  }

  /**
   * Получить лучшие мультфильмы по рейтингу
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getCartoonsRating(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=rating&type=multfilm&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении лучших мультфильмов:", error);
      throw error;
    }
  }

  /**
   * Получить обновления мультсериалов
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getCartoonSeriesUpdatings(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=updatings&type=multserial&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении обновлений мультсериалов:", error);
      throw error;
    }
  }

  /**
   * Получить новые мультсериалы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getCartoonSeriesNew(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=new&type=multserial&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении новых мультсериалов:", error);
      throw error;
    }
  }

  /**
   * Получить популярные мультсериалы
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getCartoonSeriesPopular(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=popular&type=multserial&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении популярных мультсериалов:", error);
      throw error;
    }
  }

  /**
   * Получить лучшие мультсериалы по рейтингу
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getCartoonSeriesRating(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=rating&type=multserial&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении лучших мультсериалов:", error);
      throw error;
    }
  }

  /**
   * Получить контент "Сейчас смотрят"
   * @param {number} page - номер страницы
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getWatching(page = 1) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/list?sort=watching&page=${page}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении контента 'Сейчас смотрят':", error);
      throw error;
    }
  }

  /**
   * Получить kp_id для фильма (для плееров)
   * @param {string} ident - идентификатор фильма
   * @param {string} token - токен пользователя
   * @returns {Promise<Object>} - данные с сервера с kp_id
   */
  static async getMovieKpId(
    ident,
    token = "windows_93e27bdd4ca8bfd43c106e8d96f09502_1164344"
  ) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/timeline/watch?ident=${ident}&current=99&time=0&token=${token}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении kp_id:", error);
      throw error;
    }
  }

  /**
   * Получить данные для плеера Renewall
   * @param {string} kpId - kinopoisk ID фильма
   * @param {string} token - токен для API Renewall
   * @returns {Promise<Object>} - данные с сервера включая iframe_url
   */
  static async getRenewall(kpId, token = "eedefb541aeba871dcfc756e6b31c02e") {
    try {
      const response = await fetch(
        `https://api.bhcesh.me/franchise/details?token=${token}&kinopoisk_id=${kpId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении данных Renewall:", error);
      throw error;
    }
  }

  /**
   * Сгенерировать URL для Turbo плеера
   * @param {string} kpId - kinopoisk ID фильма
   * @returns {string} - URL для iframe
   */
  static getTurboPlayerUrl(kpId) {
    return `https://92d73433.obrut.show/embed/MjM/kinopoisk/${kpId}`;
  }

  /**
   * Получить детали франшизы по kinopoisk_id
   * @param {string} kinopoiskId - ID фильма на КиноПоиске
   * @param {string} token - токен для авторизации
   * @returns {Promise<Object>} - данные с сервера
   */
  static async getFranchiseDetails(kinopoiskId, token) {
    try {
      const response = await fetch(
        `https://api.bhcesh.me/franchise/details?token=${token}&kinopoisk_id=${kinopoiskId}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("Ошибка при получении деталей франшизы:", error);
      throw error;
    }
  }
}

export default VokinoAPI;

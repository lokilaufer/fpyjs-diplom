/**
 * Класс VK
 * Управляет изображениями из VK. С помощью VK API.
 * С помощью этого класса будет выполняться загрузка изображений из vk.
 * Имеет свойства ACCESS_TOKEN и lastCallback
 */
class VK {
  static ACCESS_TOKEN = '958eb5d439726565e9333aa30e50e0f937ee432e927f0dbd541c541887d919a7c56f95c04217915c32008';
  static lastCallback = null;

  /**
   * Получает изображения
   * @param {string} id - ID пользователя VK
   * @param {Function} callback - Колбек функция для обработки результата
   */
  static get(id = '', callback) {
    // Проверяем, что передан ID пользователя
    if (!id || typeof id !== 'string') {
      console.error('VK.get: Не указан ID пользователя');
      if (callback) callback([]);
      return;
    }

    // Проверяем, что передан колбек
    if (typeof callback !== 'function') {
      console.error('VK.get: Не указана callback функция');
      return;
    }

    // Сохраняем колбек для использования в processData
    VK.lastCallback = callback;

    // Формируем URL для JSONP запроса
    const url = `https://api.vk.com/method/photos.get?` +
      `owner_id=${id}&` +
      `album_id=profile&` +
      `rev=0&` +
      `extended=1&` +
      `photo_sizes=1&` +
      `count=1000&` +
      `v=5.131&` +
      `access_token=${VK.ACCESS_TOKEN}&` +
      `callback=VK.processData`;

    // Создаем script элемент для JSONP запроса
    const scriptId = 'vk-jsonp-script';

    // Удаляем предыдущий script, если он существует
    const oldScript = document.getElementById(scriptId);
    if (oldScript) {
      oldScript.remove();
    }

    // Создаем новый script элемент
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = url;

    // Добавляем обработчик ошибок
    script.onerror = function() {
      console.error('Ошибка загрузки данных из VK API');

      // Удаляем script элемент
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }

      // Вызываем колбек с пустым массивом
      if (VK.lastCallback) {
        VK.lastCallback([]);
        VK.lastCallback = null;
      }

      alert('Ошибка при загрузке фотографий из VK. Проверьте ID пользователя и подключение к интернету.');
    };

    // Добавляем script в документ для выполнения запроса
    document.body.appendChild(script);

    console.log(`VK.get: Запрос фотографий пользователя ${id}`);
  }

  /**
   * Передаётся в запрос VK API для обработки ответа.
   * Является обработчиком ответа от сервера.
   * @param {Object} result - Результат запроса от VK API
   */
  static processData(result) {
    console.log('VK.processData: Получен ответ от VK API', result);

    // Удаляем script элемент
    const script = document.getElementById('vk-jsonp-script');
    if (script && script.parentNode) {
      script.parentNode.removeChild(script);
    }

    // Проверяем наличие ошибки в ответе
    if (result.error) {
      console.error('VK API error:', result.error);

      let errorMessage = 'Ошибка при получении фотографий из VK';
      if (result.error.error_msg) {
        errorMessage += `: ${result.error.error_msg}`;
      }

      alert(errorMessage);

      // Вызываем колбек с пустым массивом
      if (VK.lastCallback) {
        VK.lastCallback([]);
        VK.lastCallback = null;
      }
      return;
    }

    // Проверяем наличие данных
    if (!result.response || !result.response.items) {
      console.warn('VK.processData: Нет данных о фотографиях');

      if (VK.lastCallback) {
        VK.lastCallback([]);
        VK.lastCallback = null;
      }
      return;
    }

    // Обрабатываем полученные фотографии
    const photos = result.response.items;
    const images = [];

    // Для каждой фотографии находим самую большую по размеру
    photos.forEach(photo => {
      if (photo.sizes && photo.sizes.length > 0) {
        // Сортируем размеры по убыванию (самый большой первый)
        const sortedSizes = [...photo.sizes].sort((a, b) => {
          const sizeA = a.width * a.height;
          const sizeB = b.width * b.height;
          return sizeB - sizeA; // Сортировка по убыванию
        });

        // Берем самый большой размер
        const largestSize = sortedSizes[0];
        if (largestSize && largestSize.url) {
          images.push(largestSize.url);
        }
      }
    });

    console.log(`VK.processData: Найдено ${images.length} изображений`);

    // Вызываем сохраненный колбек с массивом URL изображений
    if (VK.lastCallback) {
      VK.lastCallback(images);
      VK.lastCallback = null;
    }
  }
}
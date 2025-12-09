/**
 * Основная функция для совершения запросов по Yandex API.
 * @param {Object} options - Объект с настройками запроса
 * @param {string} options.method - HTTP метод (GET, POST, DELETE)
 * @param {string} options.url - URL для запроса
 * @param {Object} options.data - Данные для отправки
 * @param {Object} options.headers - HTTP заголовки
 * @param {Function} options.callback - Колбек функция для обработки ответа
 */
const createRequest = (options = {}) => {
  // Проверяем обязательные параметры
  if (!options.url) {
    console.error('createRequest: Не указан URL для запроса');
    if (options.callback) {
      options.callback(new Error('URL не указан'), null);
    }
    return;
  }

  // Извлекаем параметры из options с значениями по умолчанию
  const {
    method = 'GET',
    url,
    data = {},
    headers = {},
    callback
  } = options;

  // Создаем объект XMLHttpRequest
  const xhr = new XMLHttpRequest();

  // Устанавливаем тип ответа
  xhr.responseType = 'json';

  // Формируем полный URL для GET запросов с параметрами
  let requestUrl = url;
  if (method === 'GET' && data && Object.keys(data).length > 0) {
    // Преобразуем объект data в строку параметров
    const params = new URLSearchParams();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        params.append(key, data[key]);
      }
    }
    requestUrl = `${url}?${params.toString()}`;
  }

  // Настраиваем соединение
  xhr.open(method, requestUrl);

  // Устанавливаем заголовки
  for (const [key, value] of Object.entries(headers)) {
    xhr.setRequestHeader(key, value);
  }

  // Обработчик успешного выполнения запроса
  xhr.onload = function() {
    // Проверяем статус ответа
    if (xhr.status >= 200 && xhr.status < 300) {
      // Успешный ответ
      if (callback) {
        callback(null, xhr.response);
      }
    } else {
      // Ошибка сервера
      const error = new Error(`HTTP ошибка ${xhr.status}: ${xhr.statusText}`);
      if (callback) {
        callback(error, xhr.response);
      }
    }
  };

  // Обработчик ошибки сети
  xhr.onerror = function() {
    const error = new Error('Ошибка сети или CORS');
    if (callback) {
      callback(error, null);
    }
  };

  // Обработчик таймаута (необязательно, но полезно)
  xhr.ontimeout = function() {
    const error = new Error('Таймаут запроса');
    if (callback) {
      callback(error, null);
    }
  };

  try {
    // Отправляем запрос
    if (method === 'GET') {
      xhr.send();
    } else {
      // Для POST, PUT, DELETE отправляем данные в теле запроса
      let requestData = null;

      if (data && Object.keys(data).length > 0) {
        // Если Content-Type не указан, используем application/json
        if (!headers['Content-Type'] && !headers['content-type']) {
          xhr.setRequestHeader('Content-Type', 'application/json');
          requestData = JSON.stringify(data);
        } else {
          // Если заголовок Content-Type указан, отправляем данные в соответствующем формате
          const contentType = headers['Content-Type'] || headers['content-type'];
          if (contentType.includes('application/json')) {
            requestData = JSON.stringify(data);
          } else if (contentType.includes('application/x-www-form-urlencoded')) {
            const params = new URLSearchParams();
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                params.append(key, data[key]);
              }
            }
            requestData = params.toString();
          } else {
            // Для других типов отправляем как есть
            requestData = data;
          }
        }
      }

      xhr.send(requestData);
    }
  } catch (error) {
    // Обработка ошибок при отправке запроса
    console.error('createRequest: Ошибка при отправке запроса', error);
    if (callback) {
      callback(error, null);
    }
  }
};
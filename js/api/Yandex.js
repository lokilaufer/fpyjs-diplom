/**
 * Класс Yandex
 * Используется для управления облаком.
 * Имеет свойство HOST
 */
class Yandex {
  static HOST = 'https://cloud-api.yandex.net/v1/disk';
  static TOKEN_KEY = 'yandex_disk_token';

  /**
   * Метод формирования и сохранения токена для Yandex API
   * @returns {string|null} Токен или null, если пользователь отменил ввод
   */
  static getToken() {
    // Пытаемся получить токен из localStorage
    let token = localStorage.getItem(this.TOKEN_KEY);

    // Если токен не найден, запрашиваем у пользователя
    if (!token) {
      token = prompt(
        'Для работы с Яндекс.Диском необходим OAuth токен.\n\n' +
        'Как получить токен:\n' +
        '1. Перейдите на https://yandex.ru/dev/disk/poligon/\n' +
        '2. Нажмите "Получить OAuth-токен"\n' +
        '3. Авторизуйтесь в Яндекс\n' +
        '4. Скопируйте полученный токен\n\n' +
        'Введите ваш OAuth токен Яндекс.Диска:',
        ''
      );

      // Если пользователь ввел токен, сохраняем его
      if (token && token.trim()) {
        token = token.trim();
        localStorage.setItem(this.TOKEN_KEY, token);
        console.log('Токен Яндекс.Диска сохранен');
      } else {
        console.warn('Пользователь не ввел токен Яндекс.Диска');
        return null;
      }
    }

    return token;
  }

  /**
   * Метод загрузки файла в облако
   * @param {string} path - Путь на Яндекс.Диске, куда загрузить файл
   * @param {string} url - URL файла для загрузки
   * @param {Function} callback - Колбек функция (err, response)
   */
  static uploadFile(path, url, callback) {
    // Получаем токен
    const token = this.getToken();
    if (!token) {
      callback(new Error('Токен Яндекс.Диска не найден. Пожалуйста, введите токен.'), null);
      return;
    }

    // Формируем данные для запроса
    const data = {
      path: path,
      url: url
    };

    // Выполняем запрос на загрузку файла
    createRequest({
      method: 'POST',
      url: `${this.HOST}/resources/upload`,
      headers: {
        'Authorization': `OAuth ${token}`,
        'Content-Type': 'application/json'
      },
      data: data,
      callback: (err, response) => {
        if (err) {
          console.error('Ошибка загрузки файла:', err);
        } else {
          console.log('Файл успешно загружен:', response);
        }
        callback(err, response);
      }
    });
  }

  /**
   * Метод удаления файла из облака
   * @param {string} path - Путь к файлу на Яндекс.Диске
   * @param {Function} callback - Колбек функция (err, response)
   */
  static removeFile(path, callback) {
    // Получаем токен
    const token = this.getToken();
    if (!token) {
      callback(new Error('Токен Яндекс.Диска не найден.'), null);
      return;
    }

    // Формируем данные для запроса
    const data = {
      path: path
    };

    // Выполняем запрос на удаление файла
    createRequest({
      method: 'DELETE',
      url: `${this.HOST}/resources`,
      headers: {
        'Authorization': `OAuth ${token}`
      },
      data: data,
      callback: (err, response) => {
        if (err) {
          console.error('Ошибка удаления файла:', err);
        } else {
          console.log('Файл успешно удален:', path);
        }
        callback(err, response);
      }
    });
  }

  /**
   * Метод получения всех загруженных файлов в облаке
   * @param {Function} callback - Колбек функция (err, response)
   */
  static getUploadedFiles(callback) {
    // Получаем токен
    const token = this.getToken();
    if (!token) {
      callback(new Error('Токен Яндекс.Диска не найден.'), null);
      return;
    }

    // Выполняем запрос на получение списка файлов
    createRequest({
      method: 'GET',
      url: `${this.HOST}/resources/files`,
      headers: {
        'Authorization': `OAuth ${token}`
      },
      callback: (err, response) => {
        if (err) {
          console.error('Ошибка получения списка файлов:', err);
        } else {
          console.log('Получен список файлов. Количество:', response?.items?.length || 0);
        }
        callback(err, response);
      }
    });
  }

  /**
   * Метод скачивания файлов
   * @param {string} url - URL файла для скачивания
   */
  static downloadFileByUrl(url) {
    if (!url) {
      console.error('URL для скачивания не указан');
      return;
    }

    // Создаем временную ссылку для скачивания
    const link = document.createElement('a');
    link.href = url;
    link.download = ''; // Браузер сам определит имя файла
    link.style.display = 'none';

    // Добавляем ссылку в документ
    document.body.appendChild(link);

    // Имитируем клик по ссылке
    link.click();

    // Удаляем ссылку из документа
    document.body.removeChild(link);

    console.log('Начато скачивание файла:', url);
  }
}
/**
 * Класс App управляет всем приложением
 */
class App {
  static searchBlock = null;
  static imageViewer = null;
  static modals = {};

  /**
   * С вызова этого метода начинается работа всего приложения
   * Он производит первоначальную настройку блоков поиска и просмотра изображений,
   * а так же всплывающих окон.
   */
  static init() {
    try {
      console.log('Инициализация приложения...');

      // Инициализация блока поиска
      const searchBlockElement = document.getElementsByClassName('search-block')[0];
      if (!searchBlockElement) {
        throw new Error('Не найден элемент .search-block');
      }
      this.searchBlock = new SearchBlock(searchBlockElement);
      console.log('Блок поиска инициализирован');

      // Инициализация просмотрщика изображений
      const imageViewerElement = document.getElementsByClassName('images-wrapper')[0];
      if (!imageViewerElement) {
        throw new Error('Не найден элемент .images-wrapper');
      }
      this.imageViewer = new ImageViewer(imageViewerElement);
      console.log('Просмотрщик изображений инициализирован');

      // Инициализация модальных окон
      this.initModals();

      console.log('Приложение успешно инициализировано');
    } catch (error) {
      console.error('Ошибка при инициализации приложения:', error);
      alert(`Ошибка при загрузке приложения: ${error.message}`);
    }
  }

  /**
   * Инициализирует всплывающие окна
   */
  static initModals() {
    try {
      console.log('Инициализация модальных окон...');

      // Модальное окно загрузки файлов
      const fileUploaderModal = $('.ui.modal.file-uploader-modal');
      if (fileUploaderModal.length === 0) {
        throw new Error('Не найдено модальное окно .file-uploader-modal');
      }

      this.modals.fileUploader = new FileUploaderModal(
        fileUploaderModal.modal({
          closable: false,
          onDeny: () => console.log('File uploader modal denied'),
          onApprove: () => console.log('File uploader modal approved'),
          onHidden: () => {
            console.log('File uploader modal hidden');
            // Очищаем содержимое при закрытии
            if (this.modals.fileUploader && this.modals.fileUploader.content) {
              this.modals.fileUploader.content.innerHTML = '';
            }
          }
        })
      );
      console.log('Модальное окно загрузки файлов инициализировано');

      // Модальное окно просмотра файлов
      const filePreviewerModal = $('.ui.modal.uploaded-previewer-modal');
      if (filePreviewerModal.length === 0) {
        throw new Error('Не найдено модальное окно .uploaded-previewer-modal');
      }

      this.modals.filePreviewer = new PreviewModal(
        filePreviewerModal.modal({
          closable: false,
          onDeny: () => console.log('File previewer modal denied'),
          onApprove: () => console.log('File previewer modal approved'),
          onHidden: () => {
            console.log('File previewer modal hidden');
            // Очищаем содержимое при закрытии
            if (this.modals.filePreviewer && this.modals.filePreviewer.content) {
              this.modals.filePreviewer.content.innerHTML = '<i class="asterisk loading icon massive"></i>';
            }
          }
        })
      );
      console.log('Модальное окно просмотра файлов инициализировано');

    } catch (error) {
      console.error('Ошибка при инициализации модальных окон:', error);
    }
  }

  /**
   * Возвращает всплывающее окно
   * Обращается к объекту App.modals и извлекает из него свойство modalName:
   * App.getModal('fileUploader'); // извлекает App.modals.fileUploader
   *
   * @param {string} name - Имя модального окна
   * @returns {BaseModal|null} Экземпляр модального окна
   */
  static getModal(name) {
    if (!this.modals || !this.modals[name]) {
      console.warn(`Модальное окно "${name}" не найдено`);
      return null;
    }
    return this.modals[name];
  }

  /**
   * Получить экземпляр блока поиска
   * @returns {SearchBlock} Экземпляр блока поиска
   */
  static getSearchBlock() {
    return this.searchBlock;
  }

  /**
   * Получить экземпляр просмотрщика изображений
   * @returns {ImageViewer} Экземпляр просмотрщика изображений
   */
  static getImageViewer() {
    return this.imageViewer;
  }

  /**
   * Установить токен Яндекс.Диска
   * @param {string} token - Токен Яндекс.Диска
   */
  static setYandexToken(token) {
    if (token && token.trim()) {
      localStorage.setItem('yandex_disk_token', token.trim());
      console.log('Токен Яндекс.Диска сохранен');
      return true;
    }
    return false;
  }

  /**
   * Получить сохраненный токен Яндекс.Диска
   * @returns {string|null} Токен Яндекс.Диска
   */
  static getYandexToken() {
    return localStorage.getItem('yandex_disk_token');
  }

  /**
   * Проверить наличие токена Яндекс.Диска
   * @returns {boolean} true если токен есть, false если нет
   */
  static hasYandexToken() {
    return !!this.getYandexToken();
  }

  /**
   * Запросить токен Яндекс.Диска у пользователя
   * @returns {boolean} true если токен был введен, false если нет
   */
  static requestYandexToken() {
    if (this.hasYandexToken()) {
      return true;
    }

    const token = prompt('Для работы с Яндекс.Диском необходимо ввести OAuth токен.\n\n' +
                         'Получить токен можно по адресу: https://yandex.ru/dev/disk/poligon/\n\n' +
                         'Введите ваш токен Яндекс.Диска:');

    if (token && token.trim()) {
      this.setYandexToken(token);
      return true;
    }

    alert('Токен не был введен. Некоторые функции могут быть недоступны.');
    return false;
  }
}

// Экспорт для глобального использования
window.App = App;
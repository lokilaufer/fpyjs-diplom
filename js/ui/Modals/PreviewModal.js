/**
 * Класс PreviewModal
 * Используется как обозреватель загруженный файлов в облако
 */
class PreviewModal extends BaseModal {
  constructor(element) {
    super(element);
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по контроллерам изображения:
   *    Отправляет запрос на удаление изображения, если клик был на кнопке delete
   *    Скачивает изображение, если клик был на кнопке download
   */
  registerEvents() {
    // 1. Клик по крестику для закрытия модального окна
    const closeIcon = this.domElement.querySelector('.x.icon');
    if (closeIcon) {
      closeIcon.addEventListener('click', (event) => {
        event.preventDefault();
        this.close();
      });
    }

    // 2. Делегирование событий для контроллеров изображения
    const content = this.content;
    if (content) {
      content.addEventListener('click', (event) => this.handleImageControls(event));
    }
  }

  /**
   * Обработчик кликов по контроллерам изображения
   * @param {Event} event - Событие клика
   */
  handleImageControls(event) {
    const target = event.target;

    // Проверяем, был ли клик на кнопке удаления
    const deleteButton = target.closest('.button.delete');
    if (deleteButton) {
      event.preventDefault();
      this.handleDelete(deleteButton);
      return;
    }

    // Проверяем, был ли клик на кнопке скачивания
    const downloadButton = target.closest('.button.download');
    if (downloadButton) {
      event.preventDefault();
      this.handleDownload(downloadButton);
    }
  }

  /**
   * Обработчик удаления изображения
   * @param {HTMLElement} button - Кнопка удаления
   */
  handleDelete(button) {
    // Получаем путь к файлу из data-атрибута
    const filePath = button.getAttribute('data-path');
    if (!filePath) {
      console.error('PreviewModal: Не указан путь к файлу для удаления');
      alert('Не удалось определить путь к файлу для удаления');
      return;
    }

    // Подтверждение удаления
    if (!confirm('Вы уверены, что хотите удалить этот файл с Яндекс.Диска?')) {
      return;
    }

    // Получаем иконку внутри кнопки
    const icon = button.querySelector('i');

    // Сохраняем оригинальные классы иконки
    const originalIconClasses = icon ? icon.className : '';

    // Показываем состояние загрузки
    if (icon) {
      icon.className = 'icon spinner loading';
    }
    button.classList.add('disabled');

    // Отправляем запрос на удаление файла
    Yandex.removeFile(filePath, (err, response) => {
      // Восстанавливаем состояние кнопки
      if (icon) {
        icon.className = originalIconClasses;
      }
      button.classList.remove('disabled');

      if (err) {
        console.error('PreviewModal: Ошибка удаления файла', err);
        alert(`Ошибка удаления файла: ${err.message}`);
        return;
      }

      // Если удаление успешно, удаляем блок изображения из DOM
      const imageContainer = button.closest('.image-preview-container');
      if (imageContainer) {
        imageContainer.remove();

        // Проверяем, остались ли еще изображения
        const remainingImages = this.content.querySelectorAll('.image-preview-container');
        if (remainingImages.length === 0) {
          this.content.innerHTML = '<p style="text-align: center; padding: 50px; font-size: 16px;">На Яндекс.Диске нет загруженных файлов</p>';
        }
      }
    });
  }

  /**
   * Обработчик скачивания изображения
   * @param {HTMLElement} button - Кнопка скачивания
   */
  handleDownload(button) {
    // Получаем URL файла из data-атрибута
    const fileUrl = button.getAttribute('data-file');
    if (!fileUrl) {
      console.error('PreviewModal: Не указан URL файла для скачивания');
      alert('Не удалось определить URL файла для скачивания');
      return;
    }

    // Скачиваем файл
    Yandex.downloadFileByUrl(fileUrl);

    // Визуальная обратная связь (необязательно)
    const icon = button.querySelector('i');
    if (icon) {
      const originalClasses = icon.className;
      icon.className = 'icon check';

      // Возвращаем оригинальную иконку через 1 секунду
      setTimeout(() => {
        icon.className = originalClasses;
      }, 1000);
    }
  }

  /**
   * Отрисовывает изображения в блоке всплывающего окна
   * @param {Array<Object>} data - Массив объектов с информацией о файлах
   */
  showImages(data) {
    // Проверяем наличие данных
    if (!data || !Array.isArray(data) || data.length === 0) {
      this.setContent('<p style="text-align: center; padding: 50px; font-size: 16px;">На Яндекс.Диске нет загруженных файлов</p>');
      return;
    }

    // Генерируем HTML для каждого изображения
    const imagesHTML = data.map(item => this.getImageInfo(item)).join('');

    // Устанавливаем содержимое
    this.setContent(imagesHTML);
  }

  /**
   * Форматирует дату в формате 2021-12-30T20:40:02+00:00(строка)
   * в формат «30 декабря 2021 г. в 23:40» (учитывая временной пояс)
   * @param {string} dateString - Дата в строковом формате ISO
   * @returns {string} Отформатированная дата
   */
  formatDate(dateString) {
    try {
      // Создаем объект Date из строки
      const date = new Date(dateString);

      // Проверяем, что дата валидна
      if (isNaN(date.getTime())) {
        return 'Дата неизвестна';
      }

      // Массивы с названиями месяцев
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];

      // Извлекаем компоненты даты с учетом локального времени
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();

      // Форматируем время с ведущими нулями
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');

      // Возвращаем отформатированную строку
      return `${day} ${month} ${year} г. в ${hours}:${minutes}`;
    } catch (error) {
      console.error('PreviewModal: Ошибка форматирования даты', error);
      return 'Дата неизвестна';
    }
  }

  /**
   * Возвращает разметку из изображения, таблицы с описанием данных изображения и кнопок контроллеров (удаления и скачивания)
   * @param {Object} item - Объект с информацией о файле
   * @returns {string} HTML разметка
   */
  getImageInfo(item) {
    // Проверяем наличие обязательных полей
    if (!item || !item.name || !item.created || !item.size) {
      console.warn('PreviewModal: Неполные данные файла', item);
      return '';
    }

    // Форматируем дату
    const formattedDate = this.formatDate(item.created);

    // Рассчитываем размер в Кб
    const sizeKb = Math.round(item.size / 1024);

    // Получаем URL для превью (если есть)
    const previewUrl = item.preview || item.file || '';

    // Создаем HTML разметку
    return `
      <div class="image-preview-container" style="margin-bottom: 30px; padding: 20px; border: 1px solid #e0e1e2; border-radius: 8px; background: #f9fafb;">
        ${previewUrl ? `
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${previewUrl}"
                 alt="${item.name}"
                 style="max-width: 100%; max-height: 250px; border-radius: 5px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          </div>
        ` : ''}

        <table class="ui celled table" style="margin-bottom: 20px;">
          <thead>
            <tr>
              <th style="width: 40%;">Имя файла</th>
              <th style="width: 35%;">Дата создания</th>
              <th style="width: 25%;">Размер</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="word-break: break-word; font-weight: 500;">${item.name}</td>
              <td style="color: #666;">${formattedDate}</td>
              <td style="font-weight: 500;">${sizeKb} Кб</td>
            </tr>
          </tbody>
        </table>

        <div class="buttons-wrapper" style="display: flex; gap: 15px; justify-content: center;">
          <button class="ui labeled icon red basic button delete"
                  data-path="${item.path || ''}"
                  style="flex: 1; max-width: 200px;">
            <i class="trash icon"></i>
            Удалить
          </button>
          <button class="ui labeled icon violet basic button download"
                  data-file="${item.file || ''}"
                  style="flex: 1; max-width: 200px;">
            <i class="download icon"></i>
            Скачать
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Переопределенный метод onShow для дополнительных действий при открытии
   */
  onShow() {
    super.onShow();
    console.log('PreviewModal: Модальное окно просмотра файлов открыто');

    // Если контент пустой, показываем индикатор загрузки
    if (this.content && this.content.innerHTML.trim() === '') {
      this.content.innerHTML = '<i class="asterisk loading icon massive"></i>';
    }
  }

  /**
   * Переопределенный метод onHide для очистки при закрытии
   */
  onHide() {
    super.onHide();
    console.log('PreviewModal: Модальное окно просмотра файлов закрыто');

    // Очищаем контент при закрытии
    if (this.content) {
      this.content.innerHTML = '<i class="asterisk loading icon massive"></i>';
    }
  }
}
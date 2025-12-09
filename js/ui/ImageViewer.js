/**
 * Класс ImageViewer
 * Используется для взаимодействием блоком изображений
 */
class ImageViewer {
  /**
   * Конструктор класса ImageViewer
   * @param {HTMLElement} element - DOM элемент блока просмотра изображений
   */
  constructor(element) {
    if (!element) {
      throw new Error('Не передан элемент ImageViewer');
    }

    this.element = element;

    // Сохраняем ссылки на важные элементы
    this.imagesContainer = element.querySelector('.images-list .row:first-child');
    this.previewImage = element.querySelector('.column.six.wide img.ui.fluid.image');
    this.selectAllButton = element.querySelector('.button.select-all');
    this.showUploadedButton = element.querySelector('.button.show-uploaded-files');
    this.sendButton = element.querySelector('.button.send');

    // Инициализируем обработчики событий
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по изображению меняет класс активности у изображения
   * 2. Двойной клик по изображению отображает изображение в блоке предпросмотра
   * 3. Клик по кнопке выделения всех изображений проверяет у всех ли изображений есть класс активности?
   *    Добавляет или удаляет класс активности у всех изображений
   * 4. Клик по кнопке "Посмотреть загруженные файлы" открывает всплывающее окно просмотра загруженных файлов
   * 5. Клик по кнопке "Отправить на диск" открывает всплывающее окно для загрузки файлов
   */
  registerEvents() {
    // 1-2. Делегирование событий для изображений (клик и двойной клик)
    if (this.imagesContainer) {
      this.imagesContainer.addEventListener('click', (event) => this.handleImageClick(event));
      this.imagesContainer.addEventListener('dblclick', (event) => this.handleImageDoubleClick(event));
    }

    // 3. Обработчик для кнопки выделения всех изображений
    if (this.selectAllButton) {
      this.selectAllButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleSelectAllClick();
      });
    }

    // 4. Обработчик для кнопки "Посмотреть загруженные файлы"
    if (this.showUploadedButton) {
      this.showUploadedButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleShowUploadedClick();
      });
    }

    // 5. Обработчик для кнопки "Отправить на диск"
    if (this.sendButton) {
      this.sendButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.handleSendToDiskClick();
      });
    }
  }

  /**
   * Обработчик клика по изображению
   * @param {Event} event - Событие клика
   */
  handleImageClick(event) {
    const imageWrapper = event.target.closest('.image-wrapper');
    if (!imageWrapper) return;

    const image = imageWrapper.querySelector('img');
    if (!image) return;

    // 1. Меняем класс активности (selected) у изображения
    image.classList.toggle('selected');

    // Обновляем состояние кнопок
    this.checkButtonText();
  }

  /**
   * Обработчик двойного клика по изображению
   * @param {Event} event - Событие двойного клика
   */
  handleImageDoubleClick(event) {
    const imageWrapper = event.target.closest('.image-wrapper');
    if (!imageWrapper) return;

    const image = imageWrapper.querySelector('img');
    if (!image || !this.previewImage) return;

    // 2. Отображаем изображение в блоке предпросмотра
    this.previewImage.src = image.src;
  }

  /**
   * Обработчик клика по кнопке выделения всех изображений
   */
  handleSelectAllClick() {
    const allImages = this.getAllImages();
    if (allImages.length === 0) return;

    // 3. Проверяем, у всех ли изображений есть класс активности
    const allSelected = allImages.every(img => img.classList.contains('selected'));

    // Добавляем или удаляем класс активности у всех изображений
    allImages.forEach(img => {
      if (allSelected) {
        img.classList.remove('selected');
      } else {
        img.classList.add('selected');
      }
    });

    // Обновляем состояние кнопок
    this.checkButtonText();
  }

  /**
   * Обработчик клика по кнопке "Посмотреть загруженные файлы"
   */
  handleShowUploadedClick() {
    // 4. Открываем всплывающее окно просмотра загруженных файлов
    const previewModal = App.getModal('filePreviewer');
    if (!previewModal) {
      console.error('Модальное окно filePreviewer не найдено');
      return;
    }

    // Очищаем предыдущий контент и показываем индикатор загрузки
    if (previewModal.content) {
      previewModal.content.innerHTML = '<i class="asterisk loading icon massive"></i>';
    }

    // Открываем модальное окно
    previewModal.open();

    // Загружаем и отображаем загруженные файлы
    Yandex.getUploadedFiles((err, response) => {
      if (err) {
        alert(`Ошибка при загрузке файлов: ${err.message}`);
        previewModal.close();
        return;
      }

      // Отображаем файлы в модальном окне
      if (previewModal.showImages) {
        previewModal.showImages(response.items || []);
      }
    });
  }

  /**
   * Обработчик клика по кнопке "Отправить на диск"
   */
  handleSendToDiskClick() {
    const selectedImages = this.getSelectedImages();
    if (selectedImages.length === 0) {
      alert('Выберите хотя бы одно изображение для отправки на диск');
      return;
    }

    // 5. Открываем всплывающее окно для загрузки файлов
    const uploadModal = App.getModal('fileUploader');
    if (!uploadModal) {
      console.error('Модальное окно fileUploader не найдено');
      return;
    }

    // Получаем URL выбранных изображений
    const imageUrls = selectedImages.map(img => img.src);

    // Отображаем изображения в модальном окне и открываем его
    if (uploadModal.showImages) {
      uploadModal.showImages(imageUrls);
      uploadModal.open();
    }
  }

  /**
   * Очищает отрисованные изображения
   */
  clear() {
    if (this.imagesContainer) {
      this.imagesContainer.innerHTML = '';
    }

    // Сбрасываем превью к изображению по умолчанию
    if (this.previewImage) {
      this.previewImage.src = 'https://yugcleaning.ru/wp-content/themes/consultix/images/no-image-found-360x250.png';
    }

    // Обновляем состояние кнопок
    this.checkButtonText();
  }

  /**
   * Отрисовывает изображения
   * @param {Array<string>} images - Массив URL изображений
   */
  drawImages(images) {
    if (!this.imagesContainer || !images || !Array.isArray(images)) {
      return;
    }

    // Проверяем, есть ли изображения для отрисовки
    if (images.length > 0 && this.selectAllButton) {
      this.selectAllButton.classList.remove('disabled');
    } else if (this.selectAllButton) {
      this.selectAllButton.classList.add('disabled');
    }

    // Создаем фрагмент для эффективной вставки
    const fragment = document.createDocumentFragment();

    images.forEach((imageUrl, index) => {
      // Создаем контейнер для изображения
      const column = document.createElement('div');
      column.className = 'four wide column image-wrapper';
      column.style.cursor = 'pointer';

      // Создаем элемент изображения
      const img = document.createElement('img');
      img.className = 'ui medium image';
      img.src = imageUrl;
      img.alt = `Изображение ${index + 1}`;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.objectFit = 'cover';

      column.appendChild(img);
      fragment.appendChild(column);
    });

    // Добавляем изображения в контейнер
    this.imagesContainer.appendChild(fragment);

    // Обновляем состояние кнопок
    this.checkButtonText();
  }

  /**
   * Контроллирует кнопки выделения всех изображений и отправки изображений на диск
   */
  checkButtonText() {
    const allImages = this.getAllImages();
    const selectedImages = this.getSelectedImages();

    // Обновляем кнопку "Выбрать всё"
    if (this.selectAllButton) {
      if (allImages.length === 0) {
        this.selectAllButton.classList.add('disabled');
      } else {
        this.selectAllButton.classList.remove('disabled');

        // Проверяем, все ли изображения выделены
        const allSelected = allImages.length > 0 &&
                           allImages.every(img => img.classList.contains('selected'));

        // Меняем текст кнопки в зависимости от состояния
        this.selectAllButton.textContent = allSelected ? 'Снять выделение' : 'Выбрать всё';
      }
    }

    // Обновляем кнопку "Отправить на диск"
    if (this.sendButton) {
      if (selectedImages.length === 0) {
        this.sendButton.classList.add('disabled');
      } else {
        this.sendButton.classList.remove('disabled');
      }
    }
  }

  /**
   * Получает все отрисованные изображения
   * @returns {Array<HTMLImageElement>} Массив элементов изображений
   */
  getAllImages() {
    if (!this.imagesContainer) return [];
    return Array.from(this.imagesContainer.querySelectorAll('img'));
  }

  /**
   * Получает выделенные изображения
   * @returns {Array<HTMLImageElement>} Массив выделенных изображений
   */
  getSelectedImages() {
    return this.getAllImages().filter(img => img.classList.contains('selected'));
  }
}
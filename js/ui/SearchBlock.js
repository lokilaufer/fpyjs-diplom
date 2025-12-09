/**
 * Класс SearchBlock
 * Используется для взаимодействием со строкой ввода и поиска изображений
 */
class SearchBlock {
  /**
   * Конструктор класса SearchBlock
   * @param {HTMLElement} element - DOM элемент блока поиска
   */
  constructor(element) {
    if (!element) {
      throw new Error('Не передан элемент SearchBlock');
    }

    this.element = element;
    this.registerEvents();
  }

  /**
   * Выполняет подписку на кнопки "Заменить" и "Добавить"
   * Клик по кнопкам выполняет запрос на получение изображений и отрисовывает их,
   * только клик по кнопке "Заменить" перед отрисовкой очищает все отрисованные ранее изображения
   */
  registerEvents() {
    // Находим кнопки "Заменить" и "Добавить" внутри элемента
    const replaceButton = this.element.querySelector('.button.replace');
    const addButton = this.element.querySelector('.button.add');
    const inputField = this.element.querySelector('input[type="text"]');

    if (!replaceButton || !addButton || !inputField) {
      console.error('Не удалось найти необходимые элементы в SearchBlock');
      return;
    }

    // Обработчик для кнопки "Заменить"
    replaceButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.handleReplaceClick();
    });

    // Обработчик для кнопки "Добавить"
    addButton.addEventListener('click', (event) => {
      event.preventDefault();
      this.handleAddClick();
    });

    // Обработчик для поля ввода (по нажатию Enter)
    inputField.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        this.handleReplaceClick();
      }
    });
  }

  /**
   * Обработчик клика по кнопке "Заменить"
   */
  handleReplaceClick() {
    const userId = this.getUserIdFromInput();
    if (!userId) return;

    // Показываем индикатор загрузки на кнопках
    this.setLoadingState(true);

    // Запрашиваем изображения у VK
    VK.get(userId, (images) => {
      // Скрываем индикатор загрузки
      this.setLoadingState(false);

      if (!images || images.length === 0) {
        alert('Не удалось загрузить фотографии. Проверьте ID пользователя и доступность профиля.');
        return;
      }

      // Получаем ImageViewer из App
      const imageViewer = App.getImageViewer();
      if (!imageViewer) {
        console.error('ImageViewer не инициализирован');
        return;
      }

      // Очищаем все ранее отрисованные изображения (только для "Заменить")
      imageViewer.clear();

      // Отрисовываем полученные изображения
      imageViewer.drawImages(images);
    });
  }

  /**
   * Обработчик клика по кнопке "Добавить"
   */
  handleAddClick() {
    const userId = this.getUserIdFromInput();
    if (!userId) return;

    // Показываем индикатор загрузки на кнопках
    this.setLoadingState(true);

    // Запрашиваем изображения у VK
    VK.get(userId, (images) => {
      // Скрываем индикатор загрузки
      this.setLoadingState(false);

      if (!images || images.length === 0) {
        alert('Не удалось загрузить фотографии. Проверьте ID пользователя и доступность профиля.');
        return;
      }

      // Получаем ImageViewer из App
      const imageViewer = App.getImageViewer();
      if (!imageViewer) {
        console.error('ImageViewer не инициализирован');
        return;
      }

      // Отрисовываем полученные изображения (добавляем к существующим)
      imageViewer.drawImages(images);
    });
  }

  /**
   * Получает ID пользователя из поля ввода
   * @returns {string|null} ID пользователя или null если невалидный
   */
  getUserIdFromInput() {
    const inputField = this.element.querySelector('input[type="text"]');
    if (!inputField) return null;

    const userId = inputField.value.trim();

    // Проверяем, что поле не пустое
    if (!userId) {
      alert('Пожалуйста, введите ID пользователя VK');
      return null;
    }

    // Проверяем, что введено число
    if (!/^\d+$/.test(userId)) {
      alert('ID пользователя должен содержать только цифры');
      return null;
    }

    return userId;
  }

  /**
   * Устанавливает состояние загрузки для кнопок
   * @param {boolean} isLoading - Флаг загрузки
   */
  setLoadingState(isLoading) {
    const replaceButton = this.element.querySelector('.button.replace');
    const addButton = this.element.querySelector('.button.add');
    const inputField = this.element.querySelector('input[type="text"]');

    if (!replaceButton || !addButton || !inputField) return;

    if (isLoading) {
      // Добавляем классы загрузки
      replaceButton.classList.add('loading');
      addButton.classList.add('loading');

      // Блокируем поле ввода
      inputField.disabled = true;

      // Меняем текст кнопок
      replaceButton.innerHTML = '<i class="spinner loading icon"></i> Загрузка...';
      addButton.innerHTML = '<i class="spinner loading icon"></i> Загрузка...';
    } else {
      // Убираем классы загрузки
      replaceButton.classList.remove('loading');
      addButton.classList.remove('loading');

      // Разблокируем поле ввода
      inputField.disabled = false;

      // Восстанавливаем текст кнопок
      replaceButton.innerHTML = 'Заменить';
      addButton.innerHTML = 'Добавить';
    }
  }
}
/**
 * Класс FileUploaderModal
 * Используется как всплывающее окно для загрузки изображений
 */
class FileUploaderModal extends BaseModal {
  constructor(element) {
    super(element);
    this.registerEvents();
  }

  /**
   * Добавляет следующие обработчики событий:
   * 1. Клик по крестику на всплывающем окне, закрывает его
   * 2. Клик по кнопке "Закрыть" на всплывающем окне, закрывает его
   * 3. Клик по кнопке "Отправить все файлы" на всплывающем окне, вызывает метод sendAllImages
   * 4. Клик по контроллерам изображения:
   *    убирает ошибку, если клик был по полю ввода
   *    отправляет одно изображение, если клик был по кнопке отправки
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

    // 2. Клик по кнопке "Закрыть" для закрытия модального окна
    const closeButton = this.domElement.querySelector('.actions .close.button');
    if (closeButton) {
      closeButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.close();
      });
    }

    // 3. Клик по кнопке "Отправить все файлы"
    const sendAllButton = this.domElement.querySelector('.actions .send-all.button');
    if (sendAllButton) {
      sendAllButton.addEventListener('click', (event) => {
        event.preventDefault();
        this.sendAllImages();
      });
    }

    // 4. Делегирование событий для контроллеров изображения
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

    // Убираем ошибку, если клик был по полю ввода
    const inputField = target.closest('input[type="text"]');
    if (inputField) {
      const inputBlock = inputField.closest('.ui.action.input');
      if (inputBlock) {
        inputBlock.classList.remove('error');
      }
      return;
    }

    // Отправляем одно изображение, если клик был по кнопке отправки
    const sendButton = target.closest('.button');
    if (sendButton && sendButton.querySelector('.upload.icon')) {
      const imageContainer = sendButton.closest('.image-preview-container');
      if (imageContainer) {
        event.preventDefault();
        this.sendImage(imageContainer);
      }
    }
  }

  /**
   * Отображает все полученные изображения в теле всплывающего окна
   * @param {Array<string>} images - Массив URL изображений
   */
  showImages(images) {
    // Проверяем наличие изображений
    if (!images || !Array.isArray(images) || images.length === 0) {
      this.setContent('<p style="text-align: center; padding: 50px; font-size: 16px;">Нет изображений для загрузки</p>');
      return;
    }

    // Генерируем HTML для каждого изображения в обратном порядке
    const imagesHTML = images.reverse().map(url => this.getImageHTML(url)).join('');

    // Устанавливаем содержимое
    this.setContent(imagesHTML);
  }

  /**
   * Формирует HTML разметку с изображением, полем ввода для имени файла и кнопкой загрузки
   * @param {string} item - URL изображения
   * @returns {string} HTML разметка
   */
  getImageHTML(item) {
    return `
      <div class="image-preview-container">
        <img src="${item}"
             alt="Изображение для загрузки"
             style="max-width: 100%; max-height: 200px; margin-bottom: 15px; border-radius: 5px;">
        <div class="ui action input">
          <input type="text"
                 placeholder="Введите путь на Яндекс.Диске (например: /VK_Photos/photo1.jpg)">
          <button class="ui primary button">
            <i class="upload icon"></i>
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Отправляет все изображения в облако
   */
  sendAllImages() {
    const imageContainers = this.content.querySelectorAll('.image-preview-container');

    if (imageContainers.length === 0) {
      alert('Нет изображений для отправки');
      return;
    }

    // Отправляем каждое изображение по очереди
    imageContainers.forEach(container => {
      this.sendImage(container);
    });
  }

  /**
   * Валидирует изображение и отправляет его на сервер
   * @param {HTMLElement} imageContainer - Контейнер с изображением
   */
  sendImage(imageContainer) {
    // Находим элементы внутри контейнера
    const input = imageContainer.querySelector('input[type="text"]');
    const inputBlock = imageContainer.querySelector('.ui.action.input');
    const button = imageContainer.querySelector('.button');
    const icon = button ? button.querySelector('i') : null;
    const image = imageContainer.querySelector('img');

    if (!input || !inputBlock || !button || !image) {
      console.error('FileUploaderModal: Не найдены необходимые элементы в контейнере');
      return;
    }

    // Получаем путь из поля ввода
    const filePath = input.value.trim();

    // Валидация: проверяем, что путь не пустой
    if (!filePath) {
      inputBlock.classList.add('error');
      alert('Введите путь для сохранения файла на Яндекс.Диске');
      return;
    }

    // Валидация: проверяем корректность пути
    if (!this.isValidPath(filePath)) {
      inputBlock.classList.add('error');
      alert('Некорректный путь. Используйте только буквы, цифры, пробелы и символы: -_. /');
      return;
    }

    // Получаем URL изображения
    const imageUrl = image.src;
    if (!imageUrl) {
      alert('Не удалось получить URL изображения');
      return;
    }

    // Блокируем элементы и показываем индикатор загрузки
    button.classList.add('disabled', 'loading');
    input.disabled = true;
    if (icon) {
      icon.className = 'spinner loading icon';
    }

    // Отправляем изображение на Яндекс.Диск
    Yandex.uploadFile(filePath, imageUrl, (err, response) => {
      // Восстанавливаем состояние элементов
      button.classList.remove('disabled', 'loading');
      input.disabled = false;
      if (icon) {
        icon.className = 'upload icon';
      }

      if (err) {
        alert(`Ошибка при загрузке: ${err.message}`);
        return;
      }

      // Успешная загрузка - удаляем контейнер
      imageContainer.remove();

      // Проверяем, остались ли изображения
      const remainingContainers = this.content.querySelectorAll('.image-preview-container');
      if (remainingContainers.length === 0) {
        alert('Все изображения успешно загружены на Яндекс.Диск!');
        this.close();
      }
    });
  }

  /**
   * Проверяет корректность пути файла
   * @param {string} path - Путь для проверки
   * @returns {boolean} true, если путь корректен
   */
  isValidPath(path) {
    // Запрещенные символы в путях Яндекс.Диска
    const invalidChars = /[<>:"|?*\x00-\x1F]/;

    // Путь не должен быть пустым и не должен содержать запрещенные символы
    return path.length > 0 && !invalidChars.test(path);
  }

  /**
   * Переопределенный метод onShow для дополнительных действий при открытии
   */
  onShow() {
    super.onShow();
    console.log('FileUploaderModal: Модальное окно загрузки файлов открыто');
  }

  /**
   * Переопределенный метод onHide для очистки при закрытии
   */
  onHide() {
    super.onHide();
    console.log('FileUploaderModal: Модальное окно загрузки файлов закрыто');

    // Очищаем контент при закрытии
    if (this.content) {
      this.content.innerHTML = '';
    }
  }
}
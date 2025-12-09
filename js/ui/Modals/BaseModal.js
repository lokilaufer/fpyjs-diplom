/**
 * Класс BaseModal
 * Используется как базовый класс всплывающего окна
 */
class BaseModal {
  /**
   * Конструктор класса BaseModal
   * @param {HTMLElement|jQuery} element - DOM элемент или jQuery объект модального окна
   */
  constructor(element) {
    // Проверяем, передан ли элемент
    if (!element) {
      throw new Error('BaseModal: Не передан элемент модального окна');
    }

    // Сохраняем элемент модального окна
    this.element = element;

    // Если передан jQuery объект, сохраняем его
    if (element instanceof jQuery || (element.jquery && element.modal)) {
      this.jqueryElement = element;
      this.domElement = element[0];
    } else {
      // Если передан DOM элемент, создаем jQuery объект
      this.domElement = element;
      this.jqueryElement = $(element);
    }

    // Проверяем, что элемент существует и является модальным окном Semantic UI
    if (!this.jqueryElement.length) {
      throw new Error('BaseModal: Элемент модального окна не найден в DOM');
    }

    // Инициализируем модальное окно Semantic UI с базовыми настройками
    this.initializeModal();
  }

  /**
   * Инициализирует модальное окно Semantic UI
   */
  initializeModal() {
    try {
      // Проверяем, не был ли элемент уже инициализирован как модальное окно
      if (!this.jqueryElement.hasClass('modal') || !this.jqueryElement.data('module-api')) {
        console.warn('BaseModal: Элемент не имеет класса "modal". Инициализируем как модальное окно Semantic UI.');
      }

      // Инициализируем модальное окно с базовыми настройками
      this.jqueryElement.modal({
        closable: false, // Отключаем закрытие по клику вне модального окна
        onShow: () => this.onShow(),
        onHide: () => this.onHide(),
        onApprove: () => this.onApprove(),
        onDeny: () => this.onDeny()
      });

      console.log('BaseModal: Модальное окно инициализировано');
    } catch (error) {
      console.error('BaseModal: Ошибка инициализации модального окна', error);
    }
  }

  /**
   * Открывает всплывающее окно
   */
  open() {
    try {
      if (this.jqueryElement && typeof this.jqueryElement.modal === 'function') {
        this.jqueryElement.modal('show');
        console.log('BaseModal: Модальное окно открыто');
      } else {
        console.error('BaseModal: Не удалось открыть модальное окно. jQuery элемент не инициализирован.');
      }
    } catch (error) {
      console.error('BaseModal: Ошибка при открытии модального окна', error);
    }
  }

  /**
   * Закрывает всплывающее окно
   */
  close() {
    try {
      if (this.jqueryElement && typeof this.jqueryElement.modal === 'function') {
        this.jqueryElement.modal('hide');
        console.log('BaseModal: Модальное окно закрыто');
      } else {
        console.error('BaseModal: Не удалось закрыть модальное окно. jQuery элемент не инициализирован.');
      }
    } catch (error) {
      console.error('BaseModal: Ошибка при закрытии модального окна', error);
    }
  }

  /**
   * Событие при открытии модального окна
   * Может быть переопределено в дочерних классах
   */
  onShow() {
    // console.log('BaseModal onShow: Модальное окно открывается');
  }

  /**
   * Событие при закрытии модального окна
   * Может быть переопределено в дочерних классах
   */
  onHide() {
    // console.log('BaseModal onHide: Модальное окно закрывается');
  }

  /**
   * Событие при подтверждении (если есть кнопка approve)
   * Может быть переопределено в дочерних классах
   */
  onApprove() {
    // console.log('BaseModal onApprove: Действие подтверждено');
    return true; // Возврат true закрывает модальное окно
  }

  /**
   * Событие при отказе (если есть кнопка deny)
   * Может быть переопределено в дочерних классах
   */
  onDeny() {
    // console.log('BaseModal onDeny: Действие отменено');
    return true; // Возврат true закрывает модальное окна
  }

  /**
   * Получает элемент контента модального окна
   * @returns {HTMLElement|null} Элемент контента или null
   */
  get content() {
    if (!this.domElement) return null;
    return this.domElement.querySelector('.content');
  }

  /**
   * Устанавливает содержимое модального окна
   * @param {string} html - HTML строка для вставки
   */
  setContent(html) {
    const contentElement = this.content;
    if (contentElement) {
      contentElement.innerHTML = html;
    } else {
      console.warn('BaseModal: Не найден элемент .content в модальном окне');
    }
  }

  /**
   * Получает элемент заголовка модального окна
   * @returns {HTMLElement|null} Элемент заголовка или null
   */
  get header() {
    if (!this.domElement) return null;
    return this.domElement.querySelector('.header');
  }

  /**
   * Устанавливает заголовок модального окна
   * @param {string} text - Текст заголовка
   */
  setHeader(text) {
    const headerElement = this.header;
    if (headerElement) {
      headerElement.textContent = text;
    } else {
      console.warn('BaseModal: Не найден элемент .header в модальном окне');
    }
  }

  /**
   * Получает элемент действий модального окна
   * @returns {HTMLElement|null} Элемент действий или null
   */
  get actions() {
    if (!this.domElement) return null;
    return this.domElement.querySelector('.actions');
  }

  /**
   * Показывает/скрывает элементы действий
   * @param {boolean} show - Показать (true) или скрыть (false)
   */
  toggleActions(show = true) {
    const actionsElement = this.actions;
    if (actionsElement) {
      actionsElement.style.display = show ? 'block' : 'none';
    }
  }
}
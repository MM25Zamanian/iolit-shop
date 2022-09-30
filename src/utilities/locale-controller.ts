import {createLogger} from '@alwatr/logger';
import {update as localizeUpdate} from '@shoelace-style/localize/dist/index';
import {notEqual} from 'lit';

import {locales} from '../config';

import type {locale} from '../types/locales';

/**
 * It updates the language and direction of the HTML element
 */
class LocaleController {
  html?: HTMLElement;
  protected _logger = createLogger('controller/locale');

  /**
   * `update()` is a function that updates the `time` property of the `Clock` class
   */
  constructor() {
    this.update();
  }

  /**
   * If the locale is not set, set it to the first locale in the list of locales
   * @returns The locale object
   */
  get locale(): locale {
    const localeString = window.localStorage.getItem('i18nLocale');

    if (!localeString) {
      this.locale = locales[0];
      return this.locale;
    }

    return <locale>JSON.parse(localeString);
  }
  /**
   * It takes the locale object, converts it to a string, and stores it in the browser's local storage
   * @param {locale} _locale - The locale object that you want to set.
   */
  set locale(_locale: locale) {
    window.localStorage.setItem('i18nLocale', JSON.stringify(_locale));
  }

  /**
   * It updates the language and direction of the HTML element
   * @returns the value of the variable isChanged.
   */
  update(): void {
    const HTMLElement = document.querySelector('html');

    if (!HTMLElement) return;

    this.html = HTMLElement;
    let isChanged = false;

    if (notEqual(this.locale.code, this.html.lang)) {
      this.html.lang = this.locale.code;
      isChanged = true;
    }
    if (notEqual(this.locale.dir, this.html.dir)) {
      this.html.dir = this.locale.dir;
      isChanged = true;
    }

    if (isChanged) {
      localizeUpdate();
      this._logger.logMethodArgs('update', {language: this.locale.code, direction: this.locale.dir});
    }
  }
}

export default LocaleController;

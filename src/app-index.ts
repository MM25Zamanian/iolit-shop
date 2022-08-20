import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {registerTranslation} from '@shoelace-style/localize/dist/index.js';
import {css, html, nothing} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import '@erbium/iconsax';
import 'pwa-helper-components/pwa-install-button.js';

import {AppElement} from './app-debt/app-element';
import en from './translation/en';
import fa from './translation/fa';
import {dbPromise} from './utilities/db';
import LocaleController from './utilities/locale-controller';
import registerSW from './utilities/register-sw';
import ThemeController from './utilities/theme-controller';

import './pages/page-home';
import './pages/page-product-list';
import './pages/page-settings';
import './pages/page-cart';
import './pages/page-about';

import type {RoutesConfig} from '@alwatr/router';
import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'app-index': AppIndex;
  }
}

/**
 * APP PWA Root Element
 *
 * ```html
 * <app-index></app-index>
 * ```
 */
@customElement('app-index')
export class AppIndex extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        inset: 0;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        position: absolute;
        flex-direction: column;
        justify-content: space-between;
        contain: layout size style;
        overflow: hidden;
        z-index: 0;
      }
      .page-container {
        position: relative;
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 0%;
        contain: size layout style;
      }
      ion-tab-bar {
        height: 56px;
      }
      ion-tab-button {
        letter-spacing: 0;
        font-size: 12px;
        font-weight: 400;
      }
      /* This will be displayed only on lazy loading. */
      [unresolved]::after {
        content: '...';
        display: block;
        font-size: 2em;
        padding-top: 30vh;
        letter-spacing: 3px;
        text-align: center;
      }
    `,
    css`
      ion-badge {
        position: absolute;
        font-size: 8pt;
        right: -10px;
        top: -6px;
      }
      ion-button {
        margin: 5px;
        width: 40px;
        height: 40px;
        position: relative;
      }
      ion-button::part(native) {
        overflow: visible !important;
      }
    `,
  ];

  constructor() {
    super();
    router.initial();
  }

  protected _serviceWorkerUpdate = new SignalInterface('sw-update');
  protected _cartSignal = new SignalInterface('cart');
  protected _localeController = new LocaleController();
  protected _themeController = new ThemeController();
  protected _cartProductCount = 0;
  protected _activePage = 'home';
  protected _listenerList: Array<unknown> = [];

  protected _routes: RoutesConfig = {
    // TODO: refactor route, we need to get active page!
    // TODO: ability to redirect!
    map: (route) => (this._activePage = route.sectionList[0]?.toString().trim() || 'home'),
    list: {
      home: {
        render: () => html`<page-home class="ion-page"></page-home>`,
      },
      shop: {
        render: () => html`<page-product-list class="ion-page" type="card"></page-product-list>`,
      },
      cart: {
        render: () => html`<page-cart class="ion-page"></page-cart>`,
      },
      settings: {
        render: () => html`<page-settings class="ion-page"></page-settings>`,
      },
      about: {
        render: () => html`<page-about class="ion-page"></page-about>`,
      },
    },
  };

  override connectedCallback(): void {
    super.connectedCallback();

    registerTranslation(en, fa);
    registerSW();

    this._listenerList.push(
        router.signal.addListener(
            (route) => {
              this._logger.logMethodArgs('routeChanged', {route});
              this._activePage = route.sectionList[0]?.toString().trim() || 'home';
              this.requestUpdate();
            },
            {receivePrevious: true},
        ),
        this._cartSignal.addListener((cart) => {
          this._cartProductCount = cart.length;
          this.requestUpdate('_cartProductCount');
        }),
    );
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html`
      ${this._renderHeaderTemplate()}
      <ion-content class="page-container"> ${router.outlet(this._routes)} </ion-content>
    `;
  }
  override async firstUpdated(): Promise<void> {
    document.body.classList.remove('unresolved');

    this._cartProductCount = await dbPromise.then((db) => db.getAll('cart')).then((cart) => cart.length);

    this.requestUpdate('_cartProductCount', 0);
  }

  protected _renderHeaderTemplate(): TemplateResult {
    const bagde = this._cartProductCount ?
      html`<ion-badge color="danger">${this._cartProductCount}</ion-badge>` :
      nothing;
    const title = <string | undefined>router.currentRoute.sectionList[0];

    return html`
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="start">
            <ion-button href="/shop">
              <ion-icon slot="icon-only" name="bag-handle"></ion-icon>
            </ion-button>
            <ion-button href="/cart">
              ${bagde}
              <ion-icon slot="icon-only" name="cart"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-buttons slot="end">
            <ion-button href="/settings">
              <ion-icon slot="icon-only" name="settings"></ion-icon>
            </ion-button>
          </ion-buttons>

          <ion-title>${this._localize.term(title ?? 'home')}</ion-title>
        </ion-toolbar>
      </ion-header>
    `;
  }
}

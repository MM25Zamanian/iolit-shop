import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {registerTranslation} from '@shoelace-style/localize/dist/index.js';
import {css, html, nothing} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {when} from 'lit/directives/when.js';

import {AppElement} from './app-debt/app-element';
import {loadData} from './director';
import routes from './router/routes';
import en from './translation/en';
import fa from './translation/fa';
import LocaleController from './utilities/locale-controller';
import registerSW from './utilities/register-sw';

import './utilities/db';

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
  protected _localeController = new LocaleController();
  protected _cartProductCount = 0;
  protected _activePage = 'home';
  protected _listenerList: Array<unknown> = [];
  protected _hideTabBar = false;

  protected _routes: RoutesConfig = {
    // TODO: refactor route, we need to get active page!
    // TODO: ability to redirect!
    map: (route) => (this._activePage = route.sectionList[0]?.toString().trim() || 'home'),
    list: routes,
  };

  override connectedCallback(): void {
    super.connectedCallback();

    registerTranslation(en, fa);
    registerSW();
    loadData.appData();

    this._listenerList.push(
      router.signal.addListener(
        (route) => {
          this._logger.logMethodArgs('routeChanged', {route});
          this._activePage = route.sectionList[0]?.toString().trim() || 'home';
          this.requestUpdate();
        },
        {receivePrevious: true}
      )
    );
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html`
      <ion-content class="page-container"> ${router.outlet(this._routes)} </ion-content>
      ${this._renderTabBar()}
    `;
  }

  protected _renderTabBar(): TemplateResult | typeof nothing {
    if (this._hideTabBar) return nothing;

    const navItemsTemplate = [];

    for (const slug in routes) {
      if (Object.prototype.hasOwnProperty.call(routes, slug)) {
        const route = routes[slug];
        const selected = this._activePage === slug;

        if (route.show_in_bar !== false) {
          navItemsTemplate.push(
            html`
              <ion-tab-button
                layout=${selected ? 'icon-top' : 'label-hide'}
                href=${router.makeUrl({sectionList: [slug]})}
                ?selected=${selected}
              >
                <ion-label>${this._localize.term(route.title)}</ion-label>
                ${when(
                  route.icon,
                  () => html`<ion-icon name=${ifDefined(selected ? route.icon : route.icon + '-outline')}></ion-icon>`
                )}
              </ion-tab-button>
            `
          );
        }
      }
    }

    return html`<ion-tab-bar>${navItemsTemplate}</ion-tab-bar>`;
  }
}

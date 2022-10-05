import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {Task} from '@lit-labs/task';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {query} from 'lit/decorators/query.js';
import {state} from 'lit/decorators/state.js';
import {map} from 'lit/directives/map.js';
import {range} from 'lit/directives/range.js';
import {repeat} from 'lit/directives/repeat.js';

import {PageElement} from '../app-debt/app-element';
import {appName} from '../config';

import '../components/p-roduct';
import '../components/m-odal-filter';
import '../components/m-odal-search';

import type {ProductInterface} from '../types/product';
import type {MetaOptions} from '../utilities/html-meta-manager';
import type {ListenerInterface} from '@alwatr/signal';
import type {InfiniteScrollCustomEvent} from '@ionic/core';
import type {TemplateResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-product-list': PageProductList;
  }
}

/**
 * Alwatr PWA Home Page Element
 *
 * ```html
 * <page-product-list></page-product-list>
 * ```
 */
@customElement('page-product-list')
export class PageProductList extends PageElement {
  static override styles = [
    PageElement.styles || [],
    css`
      :host {
        display: flex;
        flex-direction: column;
      }

      input[type='search']::-webkit-search-cancel-button,
      input[type='search']::-webkit-search-decoration {
        -webkit-appearance: none;
      }

      ion-grid {
        --ion-grid-padding: 2vw;
      }
      ion-col {
        --ion-grid-column-padding: 2vw;
      }
      ion-col[hidden] {
        display: none;
      }
    `,
  ];

  @state() protected _data: Record<string, ProductInterface> = {};
  @state() protected _scrollIndex = 6;
  @query('ion-infinite-scroll') protected _infiniteScrollElement?: HTMLIonInfiniteScrollElement;

  protected override metaData: MetaOptions = {
    title: {
      en: 'Products',
      fa: '',
    },
    titleTemplate: `%s | ${appName[this._i18nCode]}`,
  };
  protected _listenerList: Array<unknown> = [];
  protected _productListSignal = new SignalInterface('product-list');
  protected _modalPageSignal = new SignalInterface('modal-page');
  protected _dataTask = new Task(
    this,
    async (): Promise<Record<string, ProductInterface>> => {
      const data = await this._productListSignal.request(router.currentRoute.queryParamList);

      this._data = data.data;

      return data.data;
    },
    () => []
  );

  override connectedCallback(): void {
    super.connectedCallback();

    this._listenerList.push(
      router.signal.addListener(
        (route) => {
          if (route.sectionList[0] === 'products') {
            this._dataTask.run();
          }
        },
        {receivePrevious: true}
      ),
      this._productListSignal.addListener((data) => {
        this._data = data.data;

        const ionContent = this?.renderRoot?.querySelector('ion-content');
        if (ionContent) {
          ionContent.scrollToTop(1000);
        }
      })
    );
    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html`
      <ion-header> ${this._renderToolbarTemplate()} </ion-header>
      <ion-content fullscreen .scrollY=${this._dataTask.status === 2}>
        ${this._dataTask.render({
          pending: () => this._renderSkeletonCardsTemplate(),
          complete: () => this._renderCardsTemplate(),
        })}
      </ion-content>
    `;
  }

  protected _renderCardsTemplate(): TemplateResult {
    const productListTemplate = repeat(
      Object.values(this._data).filter((_product, index) => !(this._scrollIndex + 6 <= index)),
      (product) => product._id,
      (product, index) => html`
        <ion-col size="6" ?hidden=${this._scrollIndex <= index}>
          <p-roduct .info=${product}></p-roduct>
        </ion-col>
      `
    );

    return html`
      <ion-grid>
        <ion-row>${productListTemplate}</ion-row>
      </ion-grid>

      <ion-infinite-scroll @ionInfinite=${this._infiniteScroll}>
        <ion-infinite-scroll-content loading-spinner="circular"></ion-infinite-scroll-content>
      </ion-infinite-scroll>
    `;
  }
  protected _renderSkeletonCardsTemplate(): TemplateResult {
    const productListTemplate = map(
      range(10),
      () => html`
        <ion-col size="6">
          <p-roduct></p-roduct>
        </ion-col>
      `
    );

    return html`
      <ion-grid>
        <ion-row>${productListTemplate}</ion-row>
      </ion-grid>
    `;
  }
  protected _renderToolbarTemplate(): TemplateResult {
    return html`
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="menu-app"></ion-menu-button>
        </ion-buttons>

        <ion-buttons slot="primary">
          <ion-button @click=${this._openModalFilters}>
            <ion-icon slot="icon-only" name="funnel-outline"></ion-icon>
          </ion-button>
          <ion-button>
            <ion-icon slot="icon-only" name="filter-outline"></ion-icon>
          </ion-button>
          <ion-button @click=${this._openModalSearch}>
            <ion-icon slot="icon-only" name="search-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title>${this.metaData.title ? this.metaData.title[this._i18nCode] : ''}</ion-title>
      </ion-toolbar>
    `;
  }

  protected _infiniteScroll(event: InfiniteScrollCustomEvent): void {
    if (this._scrollIndex + 6 < Object.values(this._data).length) {
      this._scrollIndex += 6;
      event.target.complete();
    } else if (Object.values(this._data).length - this._scrollIndex >= 1) {
      this._scrollIndex += Object.values(this._data).length - this._scrollIndex;
      event.target.complete();
    } else {
      event.target.disabled = true;
    }
    this._logger.logMethodFull(
      '_infiniteScroll',
      {event},
      {
        _scrollIndex: this._scrollIndex,
        '_data.length': Object.values(this._data).length,
        canUp: this._scrollIndex + 6 < Object.values(this._data).length,
      }
    );
  }
  protected _openModalFilters(): void {
    this._modalPageSignal.request({component: 'm-odal-filter'});
  }
  protected _openModalSearch(): void {
    this._modalPageSignal.request({component: 'm-odal-search'});
  }
}

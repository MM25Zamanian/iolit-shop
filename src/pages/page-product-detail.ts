import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {IonicSafeString} from '@ionic/core';
import {css, html, PropertyDeclaration} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';
import {state} from 'lit/decorators/state.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {when} from 'lit/directives/when.js';

import {AppElement} from '../app-debt/app-element';

import type {locale} from '../config';
import type {ProductInterface} from '../types/product';
import type {TemplateResult, CSSResult} from 'lit';

@customElement('page-product-detail')
export class PageProductDetail extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: block;
      }
      ion-header ion-toolbar ion-back-button {
        display: block !important;
      }
    `,
    css`
      ion-grid ion-row.product__image {
        padding: 0;
      }
      ion-grid ion-row.product__image ion-col ion-thumbnail {
        --size: 100%;
        background-color: #fff;
        padding: 4vw 16vw;
      }
      ion-grid ion-row.product__header,
      ion-grid ion-row.product__footer {
        padding: 0 2vw;
      }
      ion-grid ion-row.product__header h1 {
        margin: 6vw 2vw 4vw;
        color: var(--ion-color-step-900);
        font-size: 23px;
        font-weight: 500;
      }
      ion-grid ion-row.product__header h2 {
        margin: 0 3vw 4vw;
        color: var(--ion-color-primary);
        font-size: 20px;
        font-weight: 400;
      }
      ion-grid ion-row.product__header h2 span {
        margin: 0 0.5vw;
        font-size: 14px;
        font-weight: 300;
      }

      ion-grid ion-row.product__header ion-button {
        height: 48px;
        margin: 0 4vw 4vw;
      }
      ion-grid ion-row.product__header ion-col ion-row.product__header-cart__controller {
        margin: 0 4vw 4vw;
        height: 48px;
        background-color: var(--ion-color-primary);
        border-radius: 100vw;
        box-shadow: 0 3px 1px -2px #0003, 0 2px 2px 0 #00000024, 0 1px 5px 0 #0000001f;
      }
      ion-grid ion-row.product__header ion-col ion-row.product__header-cart__controller ion-col {
        display: flex;
        align-items: center;
        justify-content: center;
      }
      ion-grid ion-row.product__header ion-col ion-row.product__header-cart__controller ion-col h5 {
        color: var(--ion-color-step-50);
        font-size: 20px;
        font-weight: 400;
        margin: auto;
      }
    `,
    css`
      ion-grid ion-row.product__footer h3 {
        margin: 2vw;
        color: var(--ion-color-step-800);
        font-size: 15px;
        font-weight: 900;
      }
      ion-grid ion-row.product__footer p {
        margin: 1vw 4vw 3vw;
        color: var(--ion-color-step-600);
        font-size: 14px;
        font-weight: 300;
      }
    `,
  ];

  @property() pid?: string;
  @state() protected _product?: ProductInterface;
  @state() protected _favorite: boolean | 'pending' = false;
  @state() protected _quantity = 0;

  protected _productListSignal = new SignalInterface('product-list');
  protected _toastMessageSignal = new SignalInterface('toast-message');

  override render(): TemplateResult {
    return html`
      <ion-header> ${this._renderToolbarTemplate()} </ion-header>
      <ion-content fullscreen>${this._product ? this._renderProductDetailTemplate(this._product) : ''}</ion-content>
    `;
  }
  override requestUpdate(
      name?: PropertyKey | undefined,
      oldValue?: unknown,
      options?: PropertyDeclaration<unknown, unknown> | undefined,
  ): void {
    super.requestUpdate(name, oldValue, options);

    if (name === 'pid' && this.pid) {
      this._productListSignal.request(false).then((products) => {
        if (this.pid) {
          this._product = products[this.pid];
          this.requestUpdate('_product');
        }
      });
    }
    if (name === '_product' && this._product) {
      this.title = this._product.name[<locale['code']> this._localize.lang()];
    }
  }

  protected _renderToolbarTemplate(): TemplateResult {
    return html`
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button href=${router.makeUrl({sectionList: ['products']})}>
            <ion-icon slot="icon-only" name="arrow-back-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="primary">
          <ion-button @click=${this._shareData}>
            <ion-icon slot="icon-only" name="share-social-outline"></ion-icon>
          </ion-button>
          <ion-button color="${this._favorite === true ? 'danger' : 'light'}" @click=${this._toggleFavorite}>
            ${when(
      this._favorite === 'pending',
      () => html` <ion-spinner slot="icon-only" duration="1000"></ion-spinner> `,
      () => html` <ion-icon slot="icon-only" name=${this._favorite ? 'heart' : 'heart-outline'}></ion-icon> `,
  )}
          </ion-button>
          <ion-button>
            <ion-icon slot="icon-only" name="cart-outline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    `;
  }
  protected _renderProductDetailTemplate(product: ProductInterface): TemplateResult {
    const localizeCode = <locale['code']> this._localize.lang();

    return html`
      <ion-grid fixed class="ion-no-padding">
        <ion-row class="product__image">
          <ion-col size="12">
            <ion-thumbnail>
              <img src=${product.image.large} />
            </ion-thumbnail>
          </ion-col>
        </ion-row>
        <ion-row class="product__header">
          <ion-col size="12">
            <h1>${product.name[localizeCode]}</h1>
          </ion-col>
          <ion-col size="12">
            <h2>
              ${this._localize.number(product.price[localizeCode])}
              <span>${this._localize.term('$price_unit')}</span>
            </h2>
          </ion-col>
          <ion-col size="12"> ${this._renderCartControllerTemplate()} </ion-col>
        </ion-row>
        <ion-row class="product__footer">
          <ion-col size="12">
            <h3>${this._localize.term('description')}</h3>
          </ion-col>
          <ion-col size="12">
            ${product.description[localizeCode].split('\n').map((paragraph) => html`<p>${paragraph.trim()}</p>`)}
          </ion-col>
        </ion-row>
      </ion-grid>
    `;
  }
  protected _renderCartControllerTemplate(): TemplateResult {
    if (this._quantity > 0) {
      return html`
        <ion-row class="product__header-cart__controller">
          <ion-buttons>
            <ion-button color="light" @click=${(): number => ++this._quantity}>
              <ion-icon slot="icon-only" name="add"></ion-icon>
            </ion-button>
          </ion-buttons>
          <ion-col>
            <h5>${this._localize.number(this._quantity)}</h5>
          </ion-col>
          <ion-buttons>
            <ion-button
              @click=${(): number => --this._quantity}
              color=${ifDefined(this._quantity > 1 ? 'light' : 'danger')}
            >
              <ion-icon slot="icon-only" name=${this._quantity > 1 ? 'remove' : 'close'}></ion-icon>
            </ion-button>
          </ion-buttons>
        </ion-row>
      `;
    }

    return html`
      <ion-button expand="block" shape="round" @click=${(): number => (this._quantity = 1)}>
        <ion-icon slot="start" name="cart"></ion-icon>
        <ion-label>${this._localize.term('add_to_cart')}</ion-label>
        <ion-icon slot="end" name="add"></ion-icon>
      </ion-button>
    `;
  }

  protected async _shareData(): Promise<void> {
    const localizeCode = <locale['code']> this._localize.lang();

    const data: ShareData = {
      title: this._product?.name[localizeCode],
      text: this._product?.description[localizeCode],
      url: window.location.href,
    };

    if ('share' in window.navigator && window.navigator.canShare(data)) {
      await window.navigator.share(data);
    }
  }
  protected async _toggleFavorite(): Promise<void> {
    if (this._favorite !== 'pending') {
      const newValue = !this._favorite;
      this._favorite = 'pending';

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });

      this._favorite = newValue;

      if (this._product) {
        const title = this._product.name[<locale['code']> this._localize.lang()];
        const message = new IonicSafeString(this._localize.term('favorite_past', title, this._favorite));
        this._toastMessageSignal.request({message: message.value, icon: 'heart'});
      }
    }
  }
}

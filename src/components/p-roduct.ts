import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {IonicSafeString} from '@ionic/core';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';
import {when} from 'lit/directives/when.js';

import {AppElement} from '../app-debt/app-element';

import type {ProductInterface} from '../types/product';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'p-roduct': Product;
  }
}

/**
 * ```html
 * <p-roduct></p-roduct>
 * ```
 */
@customElement('p-roduct')
export class Product extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: block;
        height: 100%;
      }
      ion-card.card-vertical {
        margin: 0;
        height: 100%;
      }
      ion-card.card-vertical::part(native) {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      ion-card.card-vertical ion-card-header {
        padding: 16px 12px 0;
        margin: 0 0 auto;
      }
      ion-card.card-vertical ion-card-header ion-card-title {
        font-size: 14px;
        font-weight: 500;
      }
      ion-card.card-vertical .ion-card-image {
        display: flex;
        padding: 2vw 4vw;
        position: relative;
        background-color: #fff;
      }
      ion-card.card-vertical .ion-card-image img {
        border: 0;
      }
      ion-card.card-vertical .price {
        display: inline-flex;
        padding: 0 8px 10px;
      }
      ion-card.card-vertical ion-row.ion-card-footer {
        align-items: flex-end;
        justify-content: space-between;
      }
      ion-card.card-vertical ion-row.ion-card-footer ion-buttons {
        display: inline-flex;
        padding: 0 4px 4px;
      }

      ion-card.card-vertical.card-skeleton ion-card-header {
        padding: 16px 12px 4px;
      }
      ion-card.card-vertical.card-skeleton ion-row.ion-card-footer {
        align-items: center;
        justify-content: space-between;
        padding: 0 8px 8px;
      }
      ion-card.card-vertical.card-skeleton ion-row.ion-card-footer ion-avatar {
        width: 42px;
        height: 42px;
      }
      ion-card.card-vertical.card-skeleton ion-thumbnail {
        width: 100%;
        min-height: 40vw;
      }
    `,
    css`
      ion-item ion-buttons {
        margin: 0;
      }
    `,
  ];

  @property({type: Object}) info?: ProductInterface;
  @property({reflect: true}) type: 'vertical-card' | 'item-card' = 'vertical-card';
  @property({type: Boolean, reflect: true}) favorite: boolean | 'pending' = false;

  protected _toastMessageSignal = new SignalInterface('toast-message');

  override render(): TemplateResult {
    if (!this.info) {
      return this._renderCardVerticalSkeleton();
    }
    if (this.type === 'item-card') {
      return this._renderCardItem(this.info);
    }
    return this._renderCardVertical(this.info);
  }
  protected override firstUpdated(): void {
    this._logger.logMethod('firstUpdated');

    setTimeout(() => {
      this.removeAttribute('unresolved');
    }, 500);
  }

  protected _renderCardVertical(product: ProductInterface): TemplateResult {
    const title = product.name[this._i18nCode];
    const price = this._localize.number(product.price[this._i18nCode]);
    // const description = product.description[this._i18nCode];

    return html`
      <ion-card href=${router.makeUrl({sectionList: ['products', product._id]})} class="card-vertical">
        <div class="ion-card-image">
          <img src=${product.image.normal} alt=${title} />
        </div>
        <ion-card-header>
          <ion-card-title> ${title} </ion-card-title>
        </ion-card-header>

        <ion-row class="ion-card-footer">
          <div class="price">
            <ion-text color="dark">
              ${price}
              <ion-text color="medium">
                <ion-note> ${this._localize.term('$price_unit')} </ion-note>
              </ion-text>
            </ion-text>
          </div>
          <ion-buttons>${this._renderFavoriteButton()}</ion-buttons>
        </ion-row>
      </ion-card>
    `;
  }
  protected _renderCardItem(product: ProductInterface): TemplateResult {
    const title = product.name[this._i18nCode];
    const price = this._localize.number(product.price[this._i18nCode]);
    const description = product.description[this._i18nCode];

    return html`
      <ion-item>
        <ion-thumbnail slot="start">
          <img alt=${title} src=${product.image.normal} />
        </ion-thumbnail>
        <ion-label>
          <h3>${title}</h3>
          <p>${description}</p>
          <p>${price} ${this._localize.term('$price_unit')}</p>
        </ion-label>
        <ion-buttons slot="end"> ${this._renderFavoriteButton()} </ion-buttons>
      </ion-item>
    `;
  }
  protected _renderCardVerticalSkeleton(): TemplateResult {
    return html`
      <ion-card class="card-vertical card-skeleton">
        <ion-thumbnail>
          <ion-skeleton-text animated></ion-skeleton-text>
        </ion-thumbnail>

        <ion-card-header>
          <ion-card-title>
            <ion-skeleton-text animated style="width: 80%"></ion-skeleton-text>
          </ion-card-title>
          <ion-card-subtitle>
            <ion-skeleton-text animated style="width: 60%"></ion-skeleton-text>
          </ion-card-subtitle>
        </ion-card-header>

        <ion-row class="ion-card-footer">
          <ion-skeleton-text animated style="width: 30%"></ion-skeleton-text>
          <ion-skeleton-text animated style="width: 20%"></ion-skeleton-text>

          <ion-avatar>
            <ion-skeleton-text animated></ion-skeleton-text>
          </ion-avatar>
        </ion-row>
      </ion-card>
    `;
  }
  protected _renderFavoriteButton(): TemplateResult {
    return html`
      <ion-button color=${this.favorite === true ? 'danger' : 'dark'} @click=${this._toggleFavorite}>
        ${when(
      this.favorite === 'pending',
      () => html` <ion-spinner slot="icon-only" duration="1000" color="primary"></ion-spinner> `,
      () => html` <ion-icon slot="icon-only" name=${this.favorite ? 'heart' : 'heart-outline'}></ion-icon> `,
  )}
      </ion-button>
    `;
  }

  /**
   * It toggles the favorite state of the current item, and if the item is favorited, it shows a toast
   * message
   * @param {PointerEvent} event - PointerEvent - The event that triggered the function.
   */
  protected async _toggleFavorite(event: PointerEvent): Promise<void> {
    event.preventDefault();

    if (this.favorite !== 'pending') {
      const newValue = !this.favorite;
      this.favorite = 'pending';

      await new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 2000);
      });

      this.favorite = newValue;

      if (this.info) {
        const title = this.info.name[this._i18nCode];
        const message = new IonicSafeString(this._localize.term('favorite_past', title, this.favorite));
        this._toastMessageSignal.request({message: message.value, icon: 'heart'});
      }
    }
  }
}

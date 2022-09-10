import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {IonicSafeString} from '@ionic/core';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';
import {when} from 'lit/directives/when.js';

import {AppElement} from '../app-debt/app-element';

import type {locale} from '../config';
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
      ion-card.card-vertical {
        margin: 0;
      }
      ion-card.card-vertical ion-card-header {
        padding: 16px 12px 0;
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
  ];

  @property({type: Object}) info?: ProductInterface;
  @property({type: Boolean, reflect: true}) favorite: boolean | 'pending' = false;

  protected _toastMessageSignal = new SignalInterface('toast-message');

  override render(): TemplateResult {
    if (!this.info) {
      return this._renderCardVerticalSkeleton();
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
    const title = product.name[<locale['code']> this._localize.lang()];
    const price = this._localize.number(product.price[<locale['code']> this._localize.lang()]);
    // const description = product.description[<locale['code']> this._localize.lang()];

    return html`
      <ion-card href=${router.makeUrl({sectionList: ['products', product._id]})} class="card-vertical">
        <div class="ion-card-image">
          <img src=${product.image.normal} />
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
          <ion-buttons>
            <ion-button color="${this.favorite === true ? 'danger' : 'dark'}" @click=${this._toggleFavorite}>
              ${when(
      this.favorite === 'pending',
      () => html` <ion-spinner slot="icon-only" duration="1000"></ion-spinner> `,
      () => html` <ion-icon slot="icon-only" name=${this.favorite ? 'heart' : 'heart-outline'}></ion-icon> `,
  )}
            </ion-button>
          </ion-buttons>
        </ion-row>
      </ion-card>
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
        const title = this.info.name[<locale['code']> this._localize.lang()];
        const message = new IonicSafeString(this._localize.term('favorite_past', title, this.favorite));
        this._toastMessageSignal.request({message: message.value, icon: 'heart'});
      }
    }
  }
}

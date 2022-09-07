import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';

import {AppElement} from '../app-debt/app-element';
import {ProductType} from '../utilities/db';

import type {locale} from '../config';
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
      ion-card-title {
        font-size: 22px;
        font-weight: 500;
        margin-top: 6px;
      }

      ion-card .ion-card-image {
        display: flex;
        position: relative;
        background-color: #fff;
      }
      ion-card .ion-card-image img {
        max-width: 50%;
        margin: 10px auto;
        border: 0;
      }
    `,
  ];

  @property({type: Object}) info?: ProductType;

  override render(): TemplateResult {
    if (!this.info) {
      return html``;
    }
    return this._renderCardVertical(this.info);
  }

  protected _renderCardVertical(product: ProductType): TemplateResult {
    const title = product.title[<locale['code']> this._localize.lang()];
    const price = this._localize.number(product.price[<locale['code']> this._localize.lang()]);
    const description = product.description[<locale['code']> this._localize.lang()];

    return html`
      <ion-card>
        <div class="ion-card-image">
          <img src=${product.image} />

          <ion-fab vertical="bottom" horizontal="end" edge>
            <ion-fab-button color="light" size="small">
              <ion-icon name="share-social-outline"></ion-icon>
            </ion-fab-button>
          </ion-fab>
        </div>
        <ion-card-header>
          <ion-card-title>${title}</ion-card-title>
          <ion-card-subtitle> ${price} ${this._localize.term('$price_unit')} </ion-card-subtitle>
        </ion-card-header>
        <ion-card-content>${description}</ion-card-content>
      </ion-card>
    `;
  }
}

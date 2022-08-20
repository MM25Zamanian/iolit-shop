import {SignalInterface} from '@alwatr/signal';
import {Task} from '@lit-labs/task';
import {css, html, nothing} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {repeat} from 'lit/directives/repeat.js';
import {when} from 'lit/directives/when.js';

import {AppElement} from '../app-debt/app-element';
import {dbPromise, updateCategories, updateProducts} from '../utilities/db';

import type {locale} from '../config';
import type {cartItem, product} from '../utilities/db';
import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult, CSSResult} from 'lit';

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
export class PageProductList extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: flex;
        flex-direction: column;
      }

      input[type='search']::-webkit-search-cancel-button,
      input[type='search']::-webkit-search-decoration {
        -webkit-appearance: none;
      }

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

      ion-label {
        padding-left: 7px;
      }

      ion-fab {
        display: flex;
      }

      .buy-button {
        margin: 0;
      }
      .count {
        text-align: center;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected _cartSignal = new SignalInterface('cart');
  protected _data: product[] = [];
  protected _cart: cartItem[] = [];
  protected _dataTask = new Task(this, async (): Promise<product[]> => {
    const db = await dbPromise;
    let data = await db.getAll('products');

    this._cart = await db.getAll('cart');

    if (!data.length) {
      // * If the database is empty, the information is fetched and then placed in the database

      this._logger.logProperty('data', null);

      data = await fetch(`/data.json`).then((response) => response.json());

      await updateProducts(data);
      await updateCategories(data);
    } else {
      // * Open a new Task for update products

      setTimeout(async () => {
        const data = await fetch(`/data.json`).then((response) => response.json());

        await updateProducts(data);
        await updateCategories(data);

        this._logger.logMethod('database_auto_updated');
      }, 1000);
    }

    this._data = data;
    return data;
  });

  override connectedCallback(): void {
    super.connectedCallback();
    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html`
      <ion-content fullscreen> ${this._dataTask.render({complete: () => this._renderCardTemplate()})} </ion-content>
    `;
  }
  override firstUpdated(): void {
    this._dataTask.run();
  }

  protected async _toggleFavorite(product: product, isFavorite: boolean): Promise<void> {
    const db = await dbPromise;

    await db.put('products', {...product, isFavorite: isFavorite});

    this._data = this._data.map((_product) => {
      if (_product.id === product.id) {
        _product.isFavorite = isFavorite;
      }
      return _product;
    });

    this.requestUpdate('_data');
  }
  protected async _addToCart(product: product): Promise<void> {
    const db = await dbPromise;
    await db.put('cart', {...product, count: 1});
    this._cart.push({...product, count: 1});

    this._cartSignal.dispatch(this._cart);
    this.requestUpdate('_cart');
  }
  protected async _plusProductInCart(product: product): Promise<void> {
    const db = await dbPromise;
    const productCart = this._cart.find((cartItem) => cartItem.id === product.id);
    if (productCart) {
      productCart.count++;
      await db.put('cart', productCart);

      this._cart = this._cart.map((cartItem) => {
        if (cartItem.id === productCart.id) {
          return productCart;
        }
        return cartItem;
      });

      this._cartSignal.dispatch(this._cart);
      this.requestUpdate('_cart');
    }
  }
  protected async _minusProductInCart(product: product): Promise<void> {
    const db = await dbPromise;
    const productCart = this._cart.find((cartItem) => cartItem.id === product.id);
    if (productCart) {
      if (productCart.count > 1) {
        productCart.count--;
        await db.put('cart', productCart);

        this._cart = this._cart.map((cartItem) => {
          if (cartItem.id === productCart.id) {
            return productCart;
          }
          return cartItem;
        });
      } else {
        await db.delete('cart', productCart.id);
        this._cart = <cartItem[]> this._cart
            .map((cartItem) => {
              if (cartItem.id === productCart.id) {
                return undefined;
              }
              return cartItem;
            })
            .filter((c) => c !== undefined);
      }

      this._cartSignal.dispatch(this._cart);
      this.requestUpdate('_cart');
    }
  }

  protected _renderCardTemplate(): TemplateResult {
    const listTemplate = repeat(
        this._data,
        (product) => product.id,
        (product) => {
          const productInCart = this._cart.find((cartItem) => cartItem.id === product.id);
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
                ${this._renderToggleFavoriteButton(product)}
                </ion-fab-button>
              </ion-fab>
            </div>
            <ion-card-header>
              <ion-card-title>${title}</ion-card-title>
              <ion-card-subtitle>
                ${price}
                ${this._localize.term('$price_unit')}
              </ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>${description}</ion-card-content>
            ${when(
      productInCart,
      () => this._renderProductCartController(product, productInCart),
      () => html`
                <ion-button
                  class="buy-button"
                  expand="full"
                  @click=${async (): Promise<void> => await this._addToCart(product)}
                >
                  <ion-label>${this._localize.term('add_to_cart')}</ion-label>
                  <ion-icon size="medium" name="add-outline" slot="end"></ion-icon>
                </ion-button>
              `,
  )}
          </ion-card>
        `;
        },
    );

    return html` ${listTemplate} `;
  }
  protected _renderProductCartController(product: product, productCart?: cartItem): TemplateResult | typeof nothing {
    if (!product || !productCart) return nothing;

    return html`
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button @click=${async (): Promise<void> => await this._minusProductInCart(product)}>
            <ion-icon slot="icon-only" name="${productCart.count > 1 ? 'remove-outline' : 'close-outline'}"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click=${async (): Promise<void> => await this._plusProductInCart(product)}>
            <ion-icon slot="icon-only" name="add-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title class="count">${productCart.count}</ion-title>
      </ion-toolbar>
    `;
  }
  protected _renderToggleFavoriteButton(product: product): TemplateResult {
    return html`
      <ion-fab-button
        color="danger"
        close-icon="heart"
        size="small"
        @click=${async (): Promise<void> => await this._toggleFavorite(product, !(product.isFavorite ?? false))}
        ?activated=${product.isFavorite ?? false}
      >
        <ion-icon name="heart-outline"></ion-icon>
      </ion-fab-button>
    `;
  }
}

import {SignalInterface} from '@alwatr/signal';
import {Task} from '@lit-labs/task';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {repeat} from 'lit/directives/repeat.js';

import {AppElement} from '../app-debt/app-element';
import {dbPromise} from '../utilities/db';

import type {locale} from '../config';
import type {cartItem} from '../utilities/db';
import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult, CSSResult} from 'lit';

import '@erbium/iconsax';

declare global {
  interface HTMLElementTagNameMap {
    'page-cart': PageCart;
  }
}

/**
 * APP PWA Cart Page Element
 *
 * ```html
 * <page-cart></page-cart>
 * ```
 */
@customElement('page-cart')
export class PageCart extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      .count {
        text-align: center;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected _cartSignal = new SignalInterface('cart');
  protected _cart: cartItem[] = [];
  protected _dataTask = new Task(this, async (): Promise<void> => {
    const db = await dbPromise;

    this._cart = await db.getAll('cart');
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
      <ion-content fullscreen> ${this._renderMinimalCardTemplate()} </ion-content>
    `;
  }
  override firstUpdated(): void {
    this._dataTask.run();
  }

  protected async _plusProductInCart(product: cartItem): Promise<void> {
    const db = await dbPromise;
    if (product) {
      product.count++;
      await db.put('cart', product);

      this._cart = this._cart.map((cartItem) => {
        if (cartItem.id === product.id) {
          return product;
        }
        return cartItem;
      });

      this._cartSignal.dispatch(this._cart);
      this.requestUpdate('_cart');
    }
  }
  protected async _minusProductInCart(product: cartItem): Promise<void> {
    const db = await dbPromise;
    if (product) {
      if (product.count > 1) {
        product.count--;
        await db.put('cart', product);

        this._cart = this._cart.map((cartItem) => {
          if (cartItem.id === product.id) {
            return product;
          }
          return cartItem;
        });
      } else {
        await db.delete('cart', product.id);
        this._cart = <cartItem[]> this._cart
            .map((cartItem) => {
              if (cartItem.id === product.id) {
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

  protected _renderMinimalCardTemplate(): TemplateResult {
    const listTemplate = repeat(
        this._cart,
        (product) => product.id,
        (product) => {
          const title = product.title[<locale['code']> this._localize.lang()];
          const priceFi = this._localize.number(product.price[<locale['code']> this._localize.lang()]);
          const priceTotal = this._localize.number(product.price[<locale['code']> this._localize.lang()] * product.count);

          return html`
          <ion-card>
            <ion-item>
              <ion-avatar slot="start">
                <img src="${product.image}" />
              </ion-avatar>
              <ion-label>${title}</ion-label>
            </ion-item>
            <ion-item lines="none">
              <ion-label>${product.count}</ion-label>
              <ion-label>${priceFi}</ion-label>
              <ion-label slot="end"> ${priceTotal} ${this._localize.term('$price_unit')} </ion-label>
            </ion-item>
            ${this._renderProductCartController(product)}
          </ion-card>
        `;
        },
    );

    return html`<ion-list lines="inset">${listTemplate}</ion-list>`;
  }
  protected _renderProductCartController(product: cartItem): TemplateResult {
    return html`
      <ion-toolbar color="medium">
        <ion-buttons slot="start">
          <ion-button @click=${async (): Promise<void> => await this._minusProductInCart(product)}>
            <ion-icon slot="icon-only" name="${product.count > 1 ? 'remove-outline' : 'close-outline'}"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-buttons slot="end">
          <ion-button @click=${async (): Promise<void> => await this._plusProductInCart(product)}>
            <ion-icon slot="icon-only" name="add-outline"></ion-icon>
          </ion-button>
        </ion-buttons>

        <ion-title class="count">${product.count}</ion-title>
      </ion-toolbar>
    `;
  }
}

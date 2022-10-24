import {SignalInterface} from '@alwatr/signal';
import {Task} from '@lit-labs/task';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {state} from 'lit/decorators/state.js';
import {repeat} from 'lit/directives/repeat.js';

import '@vaadin/number-field';

import {PageElement} from '../app-debt/app-element';
import {appName} from '../config';

import '../components/p-roduct';

import type {CartInterface} from '../types/cart';
import type {MetaOptions} from '../utilities/html-meta-manager';
import type {NumberFieldValueChangedEvent} from '@vaadin/number-field';
import type {TemplateResult} from 'lit';

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
export class PageCart extends PageElement {
  static override styles = [
    PageElement.styles || [],
    css`
      ion-item {
        --background: #fff;
        /*         --padding-start: 8px;
        --padding-end: 0;
        --inner-padding-end: 0; */
      }
      ion-card.invoice ion-item.total ion-label {
        text-transform: uppercase;
        color: var(--ion-color-step-650);
      }
      ion-card.invoice ion-item.total ion-label[slot='end'] {
        color: var(--ion-color-step-850);
        font-size: 24px;
      }
      ion-card.invoice ion-list.detail {
        padding: 0;
      }
      ion-card.invoice ion-list.detail ion-item {
        --min-height: min-content;
      }
      ion-card.invoice ion-list.detail ion-item ion-label {
        margin: 8px 0;
      }
      ion-card.invoice ion-list.detail ion-item ion-label[slot='end'] {
        color: var(--ion-color-step-500);
        font-size: 14px;
      }
    `,
  ];

  @state() protected _cart: CartInterface[] = [];

  protected override metaData: MetaOptions = {
    title: {
      en: 'Cart',
      fa: '',
    },
    titleTemplate: `%s | ${appName[this._i18nCode]}`,
  };
  protected _listenerList: Array<unknown> = [];
  protected _cartInvoidDetailObject: Record<string, () => string> = {
    Subtotal: () => this._invoiceDetail.subtotal.toFixed(2),
    Shipping: () => this._invoiceDetail.shipping.toFixed(2),
    Tax: () => this._invoiceDetail.tax.toFixed(2) + ' %',
  };
  protected _cartSignal = new SignalInterface('cart');
  protected _cartTask = new Task(
    this,
    async ([productId, quantity]): Promise<CartInterface[]> => {
      const cart = Object.values(
        await this._cartSignal.request({productId: <string>productId, quantity: <number>quantity})
      );
      this._cart = cart;
      return cart;
    },
    () => ['', 0]
  );

  override render(): TemplateResult {
    return html`
      <ion-header> ${this._renderToolbarTemplate()} </ion-header>
      <ion-content fullscreen> ${this._renderCartItemListTemplate()} ${this._renderCartInvoiceTemplate()} </ion-content>
    `;
  }

  protected _renderToolbarTemplate(): TemplateResult {
    return html`
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="menu-app"></ion-menu-button>
        </ion-buttons>

        <ion-title>${this.metaData.title ? this.metaData.title[this._i18nCode] : ''}</ion-title>
      </ion-toolbar>
    `;
  }
  protected _renderCartItemListTemplate(): TemplateResult {
    const cartItemListTemplate = repeat(
      this._cart,
      (cartItem) => cartItem.product._id,
      (cartItem) =>
        html`<p-roduct
          type="cart-item"
          .info=${cartItem.product}
          quantity=${cartItem.quantity}
          @quantity-changed=${this._cartQuantityChangedEvent(cartItem)}
          @product-remove=${this._cartDelProduct}
        ></p-roduct>`
    );

    return html`
      <ion-card>
        <ion-list class="ion-no-padding" lines="full"> ${cartItemListTemplate} </ion-list>
      </ion-card>
    `;
  }
  protected _renderCartInvoiceTemplate(): TemplateResult {
    const invoiceDetailTemplate = Object.entries(this._cartInvoidDetailObject).map(([title, value]) => {
      return html`
        <ion-item>
          <ion-label>
            <h3>${title}</h3>
          </ion-label>
          <ion-label slot="end">${value()}</ion-label>
        </ion-item>
      `;
    });

    return html`
      <ion-card class="invoice">
        <ion-item class="total" lines="full">
          <ion-label>
            <h2>Total</h2>
          </ion-label>
          <ion-label slot="end"> ${this._invoiceTotal.toFixed(2)} ${this._localize.term('$price_unit')} </ion-label>
        </ion-item>

        <ion-list lines="none" class="detail"> ${invoiceDetailTemplate} </ion-list>
      </ion-card>
    `;
  }

  /**
   * It runs the `_cartTask` task with the product ID and quantity of zero
   * @param event - CustomEvent<{productId: string}>
   */
  protected _cartDelProduct(event: CustomEvent<{productId: string}>): void {
    this._cartTask.run([event.detail.productId, 0]);
  }
  /**
   * "When the user changes the quantity of a product in the cart, update the cart."
   *
   * The first line of the function is a TypeScript type annotation. It's not required, but it's a good
   * idea to include it. It tells the TypeScript compiler that the first parameter is a CartInterface
   * object and the second parameter is a NumberFieldValueChangedEvent object
   * @param {CartInterface} cartItem - CartInterface - this is the cart item that was changed
   * @param {NumberFieldValueChangedEvent} event - NumberFieldValueChangedEvent
   */
  protected _cartQuantityChanged(cartItem: CartInterface, event: NumberFieldValueChangedEvent): void {
    const value = Number(event.detail.value);
    if (value && cartItem.quantity !== value) {
      this._cartTask.run([cartItem.product._id, value]);
    }
  }
  /**
   * It returns a function that takes an event and calls the `_cartQuantityChanged` function with the
   * cart item and the event
   * @param {CartInterface} cartItem - CartInterface
   * @returns A function that takes an event as an argument and calls the _cartQuantityChanged method
   * with the cartItem and event as arguments.
   */
  protected _cartQuantityChangedEvent(cartItem: CartInterface): (event: NumberFieldValueChangedEvent) => void {
    return (event: NumberFieldValueChangedEvent): void => {
      this._cartQuantityChanged(cartItem, event);
    };
  }
  /**
   * It returns an object with three properties: subtotal, shipping, and tax
   * @returns An object with the subtotal, shipping, and tax.
   */
  protected get _invoiceDetail(): {
    subtotal: number;
    shipping: number;
    tax: number;
  } {
    const subtotal = this._cart
      .map((cartItem) => cartItem.product.price[this._i18nCode] * cartItem.quantity)
      .reduce((perv, curr) => perv + curr, 0);
    const shipping = 10;
    const tax = (subtotal / 100) * 9;

    return {subtotal, shipping, tax};
  }
  /**
   * It takes the values of the invoiceDetail object and reduces them to a single value
   * @returns The total of the invoice.
   */
  protected get _invoiceTotal(): number {
    return Object.values(this._invoiceDetail).reduce((perv, curr) => perv + curr, 0);
  }
}

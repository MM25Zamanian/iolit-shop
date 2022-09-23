import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import {AppElement} from '../app-debt/app-element';

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

  override connectedCallback(): void {
    super.connectedCallback();
    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html` <ion-content fullscreen> </ion-content> `;
  }

  // protected _renderMinimalCardTemplate(): TemplateResult {
  //   const listTemplate = repeat(
  //       this._cart,
  //       (product) => product.id,
  //       (product) => {
  //         const title = product.title[<locale['code']> this._localize.lang()];
  //         const priceFi = this._localize.number(product.price[<locale['code']> this._localize.lang()]);
  //         const _______priceTotal = this._localize.number(
  //             product.price[<locale['code']> this._localize.lang()] * product.count,
  //         );

  //         return html`
  //         <ion-card>
  //           <ion-item>
  //             <ion-avatar slot="start">
  //               <img src="${product.image}" />
  //             </ion-avatar>
  //             <ion-label>${title}</ion-label>
  //           </ion-item>
  //           <ion-item lines="none">
  //             <ion-label>${product.count}</ion-label>
  //             <ion-label>${priceFi}</ion-label>
  //             <ion-label slot="end"> ${_______priceTotal} ${this._localize.term('$price_unit')} </ion-label>
  //           </ion-item>
  //           ${this._renderProductCartController(product)}
  //         </ion-card>
  //       `;
  //       },
  //   );

  //   return html`<ion-list lines="inset">${listTemplate}</ion-list>`;
  // }
  // protected _renderProductCartController(product: cartItem): TemplateResult {
  //   return html`
  //     <ion-toolbar color="medium">
  //       <ion-buttons slot="start">
  //         <ion-button @click=${async (): Promise<void> => await this._minusProductInCart(product)}>
  //           <ion-icon slot="icon-only" name="${product.count > 1 ? 'remove-outline' : 'close-outline'}"></ion-icon>
  //         </ion-button>
  //       </ion-buttons>
  //       <ion-buttons slot="end">
  //         <ion-button @click=${async (): Promise<void> => await this._plusProductInCart(product)}>
  //           <ion-icon slot="icon-only" name="add-outline"></ion-icon>
  //         </ion-button>
  //       </ion-buttons>

  //       <ion-title class="count">${product.count}</ion-title>
  //     </ion-toolbar>
  //   `;
  // }
}

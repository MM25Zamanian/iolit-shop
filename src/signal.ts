import type {CartInterface} from './types/cart';
import type {CategoryInterface} from './types/category';
import type {ProductInterface} from './types/product';
import type {ProductFilter} from './types/product-filter';
import type {cartItem} from './utilities/db';
import type {ActionSheetOptions, ComponentRef, ModalOptions, ToastOptions} from '@ionic/core';

export {};

declare global {
  interface AlwatrSignals {
    readonly cart: cartItem[];
    readonly 'sw-update': void;
    readonly 'product-list': Record<string, ProductInterface>;
    readonly 'product-list-filter': {
      data: Record<string, ProductInterface>;
      filter: ProductFilter;
    };
    readonly 'category-list': Record<string, CategoryInterface>;
    readonly 'cart-change': CartInterface[];
    readonly 'toast-message': HTMLIonToastElement;
    readonly 'action-sheet': HTMLIonActionSheetElement;
    readonly 'modal-page': HTMLIonModalElement;
  }
  interface AlwatrRequestSignals {
    readonly 'product-list': boolean;
    readonly 'product-list-filter': Record<'category', 'all' | string>;
    readonly 'category-list': boolean;
    readonly 'toast-message': ToastOptions;
    readonly 'action-sheet': ActionSheetOptions;
    readonly 'modal-page': ModalOptions<ComponentRef>;
    readonly 'cart-change': CartInterface[];
  }
}

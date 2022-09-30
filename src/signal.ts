import type {CartInterface, CartMinimizeInterface} from './types/cart';
import type {CategoryInterface} from './types/category';
import type {PageContent} from './types/page-content';
import type {ProductInterface} from './types/product';
import type {ProductFilter} from './types/product-filter';
import type {ActionSheetOptions, ComponentRef, ModalOptions, ToastOptions} from '@ionic/core';

export {};

declare global {
  interface AlwatrSignals {
    readonly 'sw-update': void;
    readonly 'product-list': {
      data: Record<string, ProductInterface>;
      filter: ProductFilter;
    };
    readonly 'category-list': Record<string, CategoryInterface>;
    readonly 'page-content': Record<string, PageContent>;
    readonly cart: Record<string, CartInterface>;
    readonly 'favorite-product-list': string[];
    readonly 'toast-message': HTMLIonToastElement;
    readonly 'action-sheet': HTMLIonActionSheetElement;
    readonly 'modal-page': HTMLIonModalElement;
  }
  interface AlwatrRequestSignals {
    readonly 'product-list': ProductFilter;
    readonly 'category-list': Record<string, never>;
    readonly 'page-content': string;
    readonly cart: CartMinimizeInterface;
    readonly 'favorite-product-list': {
      action: 'get' | 'add' | 'remove';
      productId?: string;
    };

    readonly 'toast-message': ToastOptions;
    readonly 'action-sheet': ActionSheetOptions;
    readonly 'modal-page': ModalOptions<ComponentRef>;
  }
}

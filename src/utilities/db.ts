import {openDB} from 'idb';

import type {CartMinimizeInterface} from '../types/cart';
import type {ProductInterface} from '../types/product';
import type {DBSchema} from 'idb';

interface Database extends DBSchema {
  cart: {
    value: CartMinimizeInterface;
    key: string; // TODO : Convert key to Product-Id
    indexes: {'by-product-id': string};
  };
  'favorite-product-list': {
    value: ProductInterface;
    key: string;
  };
}

export const dbPromise = openDB<Database>('iolit-db', 1, {
  upgrade(db) {
    db.createObjectStore('favorite-product-list', {autoIncrement: true});

    const cartStore = db.createObjectStore('cart', {autoIncrement: true});
    cartStore.createIndex('by-product-id', 'productId');
  },
});

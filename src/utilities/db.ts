import {openDB} from 'idb';

import type {CartMinimizeInterface} from '../types/cart';
import type {DBSchema} from 'idb';

interface Database extends DBSchema {
  cart: {
    value: CartMinimizeInterface;
    key: string;
    indexes: {'by-product-id': string};
  };
}

export const dbPromise = openDB<Database>('iolit-db', 1, {
  upgrade(db) {
    const cartStore = db.createObjectStore('cart', {autoIncrement: true});
    cartStore.createIndex('by-product-id', 'productId');
  },
});

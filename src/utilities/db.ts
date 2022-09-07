import {openDB} from 'idb';

import type {locale} from '../config';
import type {DBSchema} from 'idb';

export interface ProductType {
  id: number;
  image: string;
  isFavorite?: boolean;
  title: Record<locale['code'], string>;
  description: Record<locale['code'], string>;
  price: Record<locale['code'], number>;
  category: CategoryType;
}
export interface CategoryType {
  name: string;
  label: Record<locale['code'], string>;
}
export interface cartItem extends ProductType {
  count: number;
}

interface Database extends DBSchema {
  products: {
    value: ProductType;
    key: number;
  };
  categories: {
    value: CategoryType;
    key: number;
  };
  cart: {
    value: cartItem;
    key: number;
  };
}

export const dbPromise = openDB<Database>('iolit-db', 1, {
  upgrade(db) {
    db.createObjectStore('products', {keyPath: 'id', autoIncrement: true});
    db.createObjectStore('categories', {keyPath: 'id', autoIncrement: true});
    db.createObjectStore('cart', {keyPath: 'id', autoIncrement: true});
  },
});

export const updateProducts = async (data: ProductType[]): Promise<void> => {
  const db = await dbPromise;

  for await (const product of data) {
    const old = await db.get('products', product.id);
    if (old) {
      await db.put('products', {...old, ...product});
    } else {
      await db.put('products', product);
    }
  }
};
export const updateCategories = async (data: ProductType[]): Promise<void> => {
  const db = await dbPromise;
  const categories = data
      .map((product) => product.category)
      .filter((category, index, _categories) => {
        return _categories.findIndex((_category) => _category.name === category.name) === index;
      });

  for await (const category of categories) {
    await db.put('categories', category);
  }
};

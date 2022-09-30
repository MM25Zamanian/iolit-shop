import {CartInterface} from '../../types/cart';
import {dbPromise} from '../../utilities/db';
import {productList} from '../load-data';
import {cartSignal} from '../signal';

cartSignal.setProvider(async function (cartItem): Promise<Record<string, CartInterface>> {
  const db = await dbPromise;
  const products = await productList();
  const cartItemKey = await db.getKeyFromIndex('cart', 'by-product-id', cartItem.productId);
  if (cartItem.quantity > 0) {
    await db.put('cart', cartItem, cartItemKey);
  } else if (cartItemKey) {
    await db.delete('cart', cartItemKey);
  }

  const cartItems = await db.getAll('cart');
  const promisedReturn = cartItems.map(async (_cartItem): Promise<[string, CartInterface]> => {
    return [
      (await db.getKeyFromIndex('cart', 'by-product-id', _cartItem.productId)) ?? '',
      {
        product: products[_cartItem.productId],
        quantity: _cartItem.quantity,
      },
    ];
  });

  return Object.fromEntries(await Promise.all(promisedReturn));
});

import {dbPromise} from '../../utilities/db';
import {productList} from '../load-data';
import {favoriteProductListSignal} from '../signal';

favoriteProductListSignal.setProvider(async function (requestParam): Promise<string[]> {
  const db = await dbPromise;
  const products = await productList();

  switch (requestParam.action) {
    case 'add':
      if (requestParam.productId && products[requestParam.productId]) {
        await db.add('favorite-product-list', products[requestParam.productId], requestParam.productId);
      }
      break;
    case 'remove':
      if (requestParam.productId) {
        await db.delete('favorite-product-list', requestParam.productId);
      }
      break;
  }

  return await db.getAllKeys('favorite-product-list');
});

import {productList} from '../load-data';
import {productListSignal} from '../signal';

import type {ProductInterface} from '../../types/product';
import type {ProductFilter} from '../../types/product-filter';

productListSignal.setProvider(async function (
  filterParam
): Promise<{data: Record<string, ProductInterface>; filter: ProductFilter}> {
  const data = await productList();

  if (filterParam.category) {
    for (const [id, product] of Object.entries(data)) {
      if (!product.categoryList.includes(filterParam.category)) {
        delete data[id];
      }
    }
  }

  return {data: data, filter: filterParam};
});

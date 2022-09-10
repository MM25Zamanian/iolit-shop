import {createLogger} from '@alwatr/logger';
import {SignalInterface} from '@alwatr/signal';
import {actionSheetController, toastController, modalController} from '@ionic/core';

import {loadDataCaching} from './utilities/load-data-cache';

import type {CategoryInterface} from './types/category';
import type {ProductInterface} from './types/product';
import type {ProductFilter} from './types/product-filter';

const directorLogger = createLogger('director');
const productListSignal = new SignalInterface('product-list');
const productListFilterSignal = new SignalInterface('product-list-filter');
const categoryListSignal = new SignalInterface('category-list');
const toastMessageSignal = new SignalInterface('toast-message');
const actionSheetSignal = new SignalInterface('action-sheet');
const modalPageSignal = new SignalInterface('modal-page');
// const cartChangeSignal = new SignalInterface('cart-change');

const loadProductList = async (): Promise<Record<string, ProductInterface>> => {
  const productList = await loadDataCaching<Record<string, ProductInterface>>('/data/product-list-2.json');
  directorLogger.logProperty('loadProductList', productList);
  productListSignal.dispatch(productList);
  return productList;
};
const loadCategoryList = async (): Promise<Record<string, CategoryInterface>> => {
  const categoryList = await loadDataCaching<Record<string, CategoryInterface>>('/data/category-list.json');
  directorLogger.logProperty('categoryList', categoryList);
  categoryListSignal.dispatch(categoryList);
  return categoryList;
};
export const loadAppData = async (): Promise<void> => {
  directorLogger.logMethod('loadAppData');
  await Promise.all([loadCategoryList(), loadProductList()]);
};

productListSignal.setProvider(async (): Promise<Record<string, ProductInterface>> => {
  if (productListSignal.dispatched && productListSignal.value) {
    return productListSignal.value;
  }
  return await loadProductList();
});
productListFilterSignal.setProvider(
    async (filterParam): Promise<{data: Record<string, ProductInterface>; filter: ProductFilter}> => {
      const data = await productListSignal.request(false);
      const newData: Record<string, ProductInterface> = {};

      for (const id in data) {
        if (Object.prototype.hasOwnProperty.call(data, id)) {
          const product = data[id];
          if (filterParam.category === 'all') {
            newData[id] = product;
          } else if (product.categoryList.includes(filterParam.category)) {
            newData[id] = product;
          }
        }
      }

      return {data: newData, filter: filterParam};
    },
);
categoryListSignal.setProvider(async (): Promise<Record<string, CategoryInterface>> => {
  if (categoryListSignal.dispatched && categoryListSignal.value) {
    return categoryListSignal.value;
  }
  return await loadCategoryList();
});
toastMessageSignal.setProvider(async (requestParam): Promise<HTMLIonToastElement> => {
  const toast = await toastController.create({
    duration: 2500,
    position: 'bottom',
    buttons: [
      {
        icon: 'close',
        side: 'end',
        role: 'cancel',
      },
    ],
    ...requestParam,
  });

  await toast.present();
  return toast;
});
actionSheetSignal.setProvider(async (requestParam): Promise<HTMLIonActionSheetElement> => {
  const actoinSheet = await actionSheetController.create({
    ...requestParam,
  });

  await actoinSheet.present();
  return actoinSheet;
});
modalPageSignal.setProvider(async (requestParam): Promise<HTMLIonModalElement> => {
  const modalPage = await modalController.create(requestParam);
  await modalPage.present();
  return modalPage;
});

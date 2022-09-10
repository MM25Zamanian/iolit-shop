import {ProductInterface} from './product';

export interface CartInterface {
  product: ProductInterface;
  quantity: number;
}

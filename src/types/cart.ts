import {ProductInterface} from './product';

export interface CartMinimizeInterface {
  productId: string;
  quantity: number;
}

export interface CartInterface {
  product: ProductInterface;
  quantity: number;
}

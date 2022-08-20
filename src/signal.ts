import type {cartItem} from './utilities/db';

export {};

declare global {
  interface AlwatrSignals {
    readonly 'cart': cartItem[];
    readonly 'sw-update': void;
  }
}

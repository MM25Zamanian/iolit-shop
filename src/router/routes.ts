import {html} from 'lit';

import {navigation} from '../config';

import '../pages/page-home';
import '../pages/page-product-list';
import '../pages/page-cart';
import '../pages/page-about';

const routes: navigation = {
  shop: {
    title: 'shop',
    icon: 'pricetags',
    render: () => html`<page-product-list class="ion-page" type="card"></page-product-list>`,
  },
  cart: {
    title: 'cart',
    icon: 'cart',
    render: () => html`<page-cart class="ion-page"></page-cart>`,
  },
  home: {
    title: 'home',
    icon: 'home',
    render: () => html`<page-home class="ion-page"></page-home>`,
  },
  account: {
    title: 'account',
    icon: 'person',
    render: () => html`<page-home class="ion-page"></page-home>`,
  },
  contact: {
    title: 'contact_us',
    icon: 'call',
    render: () => html`<page-about class="ion-page"></page-about>`,
  },
};

export default routes;

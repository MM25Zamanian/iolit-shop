import {html} from 'lit';

import type {Route} from '../types/route';

import '../pages/page-home';
import '../pages/page-product-list';
import '../pages/page-product-detail';
import '../pages/page-cart';
import '../pages/page-about';

const routes: Record<string, Route> = {
  products: {
    title: 'products',
    icon: 'grid',
    render: (route) => {
      if (route.sectionList[1]) {
        return html`<page-product-detail class="ion-page" pid=${route.sectionList[1]}></page-product-detail>`;
      }
      return html`<page-product-list class="ion-page" type="card"></page-product-list>`;
    },
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
  'contact-us': {
    title: 'contact_us',
    icon: 'call',
    render: () => html`<page-about class="ion-page"></page-about>`,
  },
  '404': {
    title: '404',
    show_in_bar: false,
    render: () => html`<page-about class="ion-page"></page-about>`,
  },
};

export default routes;

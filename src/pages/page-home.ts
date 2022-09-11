import {css, html, nothing} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import {AppElement} from '../app-debt/app-element';

import '../components/b-anner';
import '../components/p-roduct';

import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-home': PageHome;
  }
}

/**
 * APP PWA Home Page Element
 *
 * ```html
 * <page-home></page-home>
 * ```
 */
@customElement('page-home')
export class PageHome extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      .banners {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 6px;
      }
      .banners b-anner {
        --height: 40vw;
      }
      .banners .banners-group {
        display: flex;
        gap: 8px;
      }
      .banners .banners-group b-anner {
        flex: 1 1 0;
        --title-fs: 13px;
        --title-fw: 100;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected _banners = [
    [
      {
        label: 'mens_t_shirts',
        src: '/images/banners/mens_t-shirts.jpg',
        href: '',
      },
      {
        label: 'womens_t_shirts',
        src: '/images/banners/womens_t-shirts.jpg',
        href: '',
      },
    ],
    [
      {
        label: 'womens_outerwear',
        src: '/images/banners/womens_outerwear.jpg',
        href: '',
      },
      {
        label: 'mens_outerwear',
        src: '/images/banners/mens_outerwear.jpg',
        href: '',
      },
    ],
  ];

  override connectedCallback(): void {
    super.connectedCallback();
    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html` <ion-content> ${this._renderBanners()} </ion-content> `;
  }

  protected _renderBanners(): TemplateResult | typeof nothing {
    const bannersTemplate = this._banners.map((banner) => {
      if (Array.isArray(banner)) {
        const _bannerTemplate = banner.map((banner) => this._renderBanner(banner));
        return html`<div class="banners-group">${_bannerTemplate}</div>`;
      }

      return this._renderBanner(banner);
    });

    return html` <div class="banners">${bannersTemplate}</div> `;
  }
  protected _renderBanner(banner: {label: string; src: string; href: string}): TemplateResult {
    return html`<b-anner label=${this._localize.term(banner.label)} src=${banner.src} href=${banner.href}></b-anner>`;
  }
}

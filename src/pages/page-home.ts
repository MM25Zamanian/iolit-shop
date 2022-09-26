import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {Task} from '@lit-labs/task';
import {css, html, nothing} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {map} from 'lit/directives/map.js';

import {AppElement} from '../app-debt/app-element';

import '../components/b-anner';
import '../components/s-croller';
import '../components/p-roduct';

import type {locale} from '../config';
import type {InfoBanner} from '../types/banner';
import type {ProductInterface} from '../types/product';
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
        padding: 6px 6px 12px;
      }
      .banners b-anner {
        --height: 50vw;
        --title-fs: 16px;
        --title-fw: 300;
      }
      .banners .banners-group {
        display: flex;
        gap: 8px;
      }
      .banners .banners-group b-anner {
        flex: 1 1 0;
        --title-fs: 13px;
        --title-fw: 100;
        --height: 30vw;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected _categoryListSignal = new SignalInterface('category-list');
  protected _productListSignal = new SignalInterface('product-list');
  protected _bannerListSignal = new SignalInterface('banner-list');
  protected _banners: Record<'banners', InfoBanner[]>[] = [];
  protected _productsByCategories: Record<string, ProductInterface[]> = {};
  protected _bannersTask = new Task(
    this,
    async (): Promise<typeof this._banners> => {
      const bannerRowList = await this._bannerListSignal.request({});
      const categoryList = await this._categoryListSignal.request({});

      /**
       * * replace all `CategoryBanner` to `InfoBanner`
       */
      for (const _id in bannerRowList) {
        if (Object.prototype.hasOwnProperty.call(bannerRowList, _id)) {
          const bannerRow = bannerRowList[_id];
          bannerRow.banners = (
            await Promise.all(
              bannerRow.banners.map(async (banner): Promise<InfoBanner | undefined> => {
                if ('categoryId' in banner && categoryList[banner.categoryId]._id) {
                  const category = categoryList[banner.categoryId];
                  return {
                    label: category.title[<locale['code']>this._localize.lang()],
                    src: category.image,
                    imageElement: await this._loadImage(category.image),
                    href: router.makeUrl({
                      sectionList: ['products'],
                      queryParamList: {category: category.slug},
                    }),
                  };
                } else if ('src' in banner) {
                  return banner;
                }
                return undefined;
              })
            )
          ).filter((banner) => banner !== undefined) as InfoBanner[];
        }
      }

      this._banners = Object.values(<Record<string, Record<'banners', InfoBanner[]>>>bannerRowList);
      this._logger.logProperty('_banners', {bannerRowList});

      return this._banners;
    },
    () => []
  );
  protected _productsTask = new Task(
    this,
    async (): Promise<Record<string, ProductInterface>> => {
      const products = await this._productListSignal.request({});
      const categories = await this._categoryListSignal.request({});
      const productsByCategories: Record<string, ProductInterface[]> = {};

      await this._bannersTask.taskComplete;

      for (const product of Object.values(products)) {
        for (const productCategorySlug of product.categoryList) {
          const category = Object.values(categories).find((category) => category.slug === productCategorySlug);

          if (category) {
            const localizeCode = <locale['code']>this._localize.lang();

            productsByCategories[category.title[localizeCode]] = [
              ...(productsByCategories[category.title[localizeCode]] ?? []),
              product,
            ];
          }
        }
      }

      this._productsByCategories = productsByCategories;
      this._logger.logProperty('_products', {products, productsByCategories});

      return products;
    },
    () => []
  );

  override connectedCallback(): void {
    super.connectedCallback();
    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    return html`
      <ion-content>
        ${this._bannersTask.render({
          pending: () => this._renderBannersSkeleton(),
          complete: () => this._renderBanners(),
        })}
        ${this._productsTask.render({
          complete: () => this._renderProductScrollers(),
        })}
      </ion-content>
    `;
  }

  protected _renderBannersSkeleton(): TemplateResult {
    return html`
      <div class="banners">
        <b-anner skeleton></b-anner>
        <div class="banners-group">
          <b-anner skeleton></b-anner>
          <b-anner skeleton></b-anner>
        </div>
        <div class="banners-group">
          <b-anner skeleton></b-anner>
          <b-anner skeleton></b-anner>
        </div>
        <b-anner skeleton></b-anner>
      </div>
    `;
  }
  protected _renderBanners(): TemplateResult | typeof nothing {
    const bannerRowsTemplate = this._banners.map((bannerRow) => {
      if (bannerRow.banners.length === 1) {
        return this._renderBanner(bannerRow.banners[0]);
      }

      return html` <div class="banners-group">${map(bannerRow.banners, (banner) => this._renderBanner(banner))}</div> `;
    });

    return html` <div class="banners">${bannerRowsTemplate}</div> `;
  }
  protected _renderBanner(banner: InfoBanner): TemplateResult {
    return html`
      <b-anner
        label=${banner.label}
        src=${banner.src}
        href=${ifDefined(banner.href)}
        .image=${banner.imageElement}
      ></b-anner>
    `;
  }
  protected _renderProductScrollers(): TemplateResult {
    const cardScrollerTemplates = Object.entries(this._productsByCategories)
      .slice(0, 2)
      .map(([category, products]) => {
        const productCardTemplates = products
          .slice(0, 4)
          .map((product) => html` <p-roduct .info=${product}></p-roduct> `);

        return html`
          <ion-item lines="none">
            <ion-label slot="start">${category}</ion-label>
            <ion-button fill="clear" slot="end"> More </ion-button>
          </ion-item>
          <s-croller> ${productCardTemplates} </s-croller>
        `;
      });

    return html`${cardScrollerTemplates}`;
  }

  protected async _loadImage(source: string): Promise<HTMLImageElement> {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', reject);
      image.src = source;
    });
  }
}

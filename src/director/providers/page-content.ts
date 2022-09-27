import {InfoBanner, InfoBannerRowInterface} from '../../types/banner';
import {categoryToInfoBanner} from '../../utilities/category-to-info-banner';
import {categoryList as getCategoryList, pageContent, productList as getProductList} from '../load-data';
import {pageContentSignal} from '../signal';

import type {PageContent} from '../../types/page-content';

pageContentSignal.setProvider(async function (pageTagName): Promise<Record<string, PageContent>> {
  pageTagName = pageTagName.toLowerCase();
  const purePageContents = await pageContent(pageTagName);
  const pageContents: Record<string, PageContent> = {};
  const categoryList = await getCategoryList();
  const productList = await getProductList();

  for (const [contentId, content] of Object.entries(purePageContents)) {
    if (content.type === 'banner') {
      for (const [bannerRowId, bannerRow] of Object.entries(content.data)) {
        const promisedBannerRow = bannerRow.banners.map(async (banner): Promise<InfoBanner> => {
          if ('categoryId' in banner) {
            return await categoryToInfoBanner(banner.categoryId, categoryList);
          }
          return banner;
        });
        content.data[bannerRowId] = <InfoBannerRowInterface>{
          banners: <InfoBanner[]>await Promise.all(promisedBannerRow),
        };
        content.data = content.data as Record<string, InfoBannerRowInterface>;
      }

      pageContents[contentId] = content as {type: 'banner'; data: Record<string, InfoBannerRowInterface>};
    }
    if (content.type === 'scroller') {
      pageContents[contentId] = {
        type: content.type,
        data: {
          title: content.data.title,
          href: content.data.href,
          productList: Object.fromEntries(
            content.data.productIdList.map((productId) => [productId, productList[productId]])
          ),
        },
      };
    }
  }

  return pageContents;
});

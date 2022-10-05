import type {locale} from '../config';
import type {MultiLanguageStringType} from '../types/language';

interface ImageMetaOptions {
  url: string;
  alt?: string;
  width?: string;
  height?: string;
}
export interface MetaOptions {
  title?: MultiLanguageStringType;
  titleTemplate?: string | null;
  description?: MultiLanguageStringType | null;
  image?: ImageMetaOptions | null;
  url?: string;
}

function lang(): locale['code'] {
  return (document.documentElement.lang || navigator.language) as locale['code'];
}

/**
 * It takes an object with a bunch of optional properties, and then it sets the corresponding meta tags
 * on the page
 * @param {MetaOptions} options - MetaOptions
 */
export const updateMeta = (options: MetaOptions): void => {
  const {title, titleTemplate, description, image, url} = options;

  if (title && title[lang()]) {
    const finalTitle = titleTemplate ? titleTemplate.replace('%s', title[lang()]) : title[lang()];

    document.title = finalTitle;
    setMetaTag('property', 'og:title', finalTitle);
  }

  if (description) {
    setMetaTag('name', 'description', description[lang()]);
    setMetaTag('property', 'og:description', description[lang()]);
  } else if (description === null) {
    setMetaTag('name', 'description', '');
    setMetaTag('property', 'og:description', '');
  }

  if (image) {
    if (image.url) {
      setMetaTag('property', 'og:image', image.url);
    }
    if (image.alt) {
      setMetaTag('property', 'og:image:alt', image.alt);
    }
    if (image.width) {
      setMetaTag('property', 'og:image:width', image.width);
    }
    if (image.height) {
      setMetaTag('property', 'og:image:height', image.height);
    }
  } else if (image === null) {
    setMetaTag('property', 'og:image', '');
    setMetaTag('property', 'og:image:alt', '');
    setMetaTag('property', 'og:image:width', '');
    setMetaTag('property', 'og:image:height', '');
  }

  if (url) {
    setLinkTag('canonical', url);
    setMetaTag('property', 'og:url', url);
  }
};

/**
 * It sets the content of a meta tag in the document head
 * @param {string} attributeName - The name of the attribute you want to set.
 * @param {string} attributeValue - The value of the attribute you want to set.
 * @param {string} content - The content of the meta tag.
 */
export const setMetaTag = (attributeName: string, attributeValue: string, content: string): void => {
  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }

  element.setAttribute('content', content);
};

/**
 * It removes a meta tag from the document head
 * @param {string} attributeName - The name of the attribute you want to remove.
 * @param {string} attributeValue - The value of the attribute you want to remove.
 */
export const removeMetaTag = (attributeName: string, attributeValue: string): void => {
  const element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);

  if (element) {
    document.head.removeChild(element);
  }
};

export const setLinkTag = (rel: string, href: string): void => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }

  element.setAttribute('href', href);
};

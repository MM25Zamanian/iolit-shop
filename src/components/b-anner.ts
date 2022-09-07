import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';

import {AppElement} from '../app-debt/app-element';

import type {TemplateResult, CSSResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'b-anner': Banner;
  }
}

/**
 * ```html
 * <b-anner></b-anner>
 * ```
 */
@customElement('b-anner')
export class Banner extends AppElement {
  static override styles = [
    ...(<CSSResult[]>AppElement.styles),
    css`
      :host {
        display: flex;
        margin: var(--margin, 2px);
        overflow: hidden;
        align-items: center;
        justify-content: center;
        height: var(--height);
        box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;
      }
      .banner-image {
        display: flex;
        position: relative;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: var(--border-radius, 4px);
      }
      .banner-image img {
        min-width: 100%;
        max-width: none;
        width: auto;

        min-height: 100%;
        height: auto;

        object-fit: cover;
      }
      .banner-title {
        position: absolute;
        background-color: #333;
        color: white;
        font-weight: 400;
        margin: auto;
        padding: 0.3em 1.2em;
        border-radius: 6px;
        font-size: var(--title-fs, 20px);
        user-select: none;
      }
      @supports ((-webkit-backdrop-filter: blur(0)) or (backdrop-filter: blur(0))) {
        .banner-title {
          backdrop-filter: saturate(2.5) brightness(70%) blur(20px);
          background-color: #0001;
        }
      }
    `,
  ];

  @property() label = '';
  @property() src = '';
  @property() href = '';
  @property({type: Boolean, reflect: true}) loaded = false;

  override render(): TemplateResult {
    if (this.href.length) {
      return html`
        <a class="banner-image" href=${this.href}>
          <h2 class="banner-title">${this.label}</h2>
          ${this._renderImage()}
        </a>
      `;
    }

    return html`
      <div class="banner-image">
        <h2 class="banner-title">${this.label}</h2>
        ${this._renderImage()}
      </div>
    `;
  }
  protected _renderImage(): TemplateResult {
    if (this.loaded) {
      return html` <img src=${this.src} alt=${this.label} /> `;
    }

    if (document.readyState === 'complete') {
      this._imageLoad();
    } else {
      document.addEventListener('readystatechange', () => {
        if (document.readyState === 'complete') {
          this._imageLoad();
        }
      });
    }

    return html` <img src="/images/banners/placeholder.png" alt=${this.label} /> `;
  }

  protected _imageLoad(): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => {
        this.loaded = true;
        resolve(image);
      });
      image.addEventListener('error', (error: ErrorEvent) => {
        reject(error);
      });
      image.src = this.src;
    });
  }
}

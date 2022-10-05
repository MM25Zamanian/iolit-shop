import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {ifDefined} from 'lit/directives/if-defined.js';

import {PageElement} from '../app-debt/app-element';
import {appName, developerTeam} from '../config';
import {MetaOptions} from '../utilities/html-meta-manager';

import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-about': PageAbout;
  }
}

/**
 * APP PWA About Page Element
 *
 * ```html
 * <page-about></page-about>
 * ```
 */
@customElement('page-about')
export class PageAbout extends PageElement {
  static override styles = [
    PageElement.styles || [],
    css`
      ion-avatar {
        background-color: #fff;
        --ion-padding: 6px;
      }
      h1 {
        font-size: 18px;
        font-weight: 900;
        margin: auto 12px auto 0;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected override metaData: MetaOptions = {
    title: {
      en: 'Contact Us',
      fa: '',
    },
    titleTemplate: `%s | ${appName[this._i18nCode]}`,
  };

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
      <ion-header> ${this._renderToolbarTemplate()} </ion-header>
      <ion-content fullscreen> </ion-content>
    `;
  }

  protected _renderToolbarTemplate(): TemplateResult {
    return html`
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button menu="menu-app"></ion-menu-button>
        </ion-buttons>

        <ion-title>${this.metaData.title ? this.metaData.title[this._i18nCode] : ''}</ion-title>
      </ion-toolbar>
    `;
  }
  protected _renderDeveloperTeamList(): TemplateResult {
    const developerTeamTemplate = developerTeam.map(
      (developer) => html`
        <ion-item href=${ifDefined(developer.link)} target="_blank">
          <ion-avatar slot="start">
            <img src=${developer.image} alt="" />
          </ion-avatar>
          <ion-label>
            <h3>${this._localize.term(developer.name)}</h3>
            <p>${this._localize.term(developer.description)}</p>
          </ion-label>
        </ion-item>
      `
    );
    return html`
      <ion-list lines="full">
        <ion-list-header>${this._localize.term('developer_team')}</ion-list-header>
        ${developerTeamTemplate}
      </ion-list>
    `;
  }
}

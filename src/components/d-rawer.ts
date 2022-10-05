import {router} from '@alwatr/router';
import {css, html, PropertyDeclaration} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {state} from 'lit/decorators/state.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {when} from 'lit/directives/when.js';

import {AppElement} from '../app-debt/app-element';
import routes from '../router/routes';

import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'd-rawer': Drawer;
  }
}

@customElement('d-rawer')
export class Drawer extends AppElement {
  static override styles = [
    AppElement.styles || [],
    css`
      :host {
        display: block;
        height: 100%;
        background-color: var(--background);
        --background: #fff;
        --ion-item-background: var(--background);
      }

      ion-header {
        background-color: var(--background);
        position: relative;
      }
      ion-header ion-item {
        padding: 16px 0;
      }
      ion-header ion-item::part(native) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      ion-header ion-item ion-avatar {
        width: var(--size);
        height: var(--size);
        margin: 0;

        --size: 56px;
      }
      ion-header ion-item ion-label {
        margin-bottom: 0 !important;
      }
      ion-header ion-item ion-label h4,
      ion-header ion-item ion-label h5 {
        margin: 0 !important;
        font-family: 'Roboto';
      }
      ion-header ion-item ion-label h4 {
        color: var(--ion-text-color);
        font-size: 1.3rem !important;
      }
      ion-header ion-item ion-label h5 {
        color: var(--ion-color-step-600);
        font-size: 0.9rem !important;
      }
    `,
    css`
      ion-content {
        --background: #fff;
      }
      ion-content ion-item[button] {
        margin: 2px 8px;
        font-size: 1.15rem;
        font-weight: 500;

        --border-radius: 4px;
      }
      ion-content ion-item[button] ion-icon {
        color: var(--ion-color-step-550);
        font-size: 1.7rem;
      }
      ion-content ion-item[button] * {
        margin-top: auto !important;
        margin-bottom: auto !important;
      }

      ion-content ion-item[button][activated] {
        --background: var(--ion-color-step-50);
        --color: var(--ion-color-primary);
      }
      ion-content ion-item[button][activated] ion-icon {
        color: var(--ion-color-primary);
      }
    `,
  ];

  @state() protected _activePage = 'home';
  protected _listenerList: Array<unknown> = [];

  override connectedCallback(): void {
    super.connectedCallback();

    this._listenerList.push(
      router.signal.addListener(
        (route) => {
          this._logger.logMethodArgs('routeChanged', {route});
          this._activePage = route.sectionList[0]?.toString().trim() || 'home';
        },
        {receivePrevious: true}
      )
    );
  }
  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }
  override render(): TemplateResult {
    const navItemsTemplate = Object.entries(routes)
      .filter(([_, route]) => route.show_in_bar !== false)
      .map(([slug, route]) => {
        const selected: boolean = router.currentRoute.sectionList[0] === slug;

        return html`
          <ion-item button href=${router.makeUrl({sectionList: [slug]})} ?activated=${selected}>
            ${when(route.icon, () => html` <ion-icon name=${ifDefined(route.icon)} slot="start"></ion-icon> `)}
            <ion-label>${this._localize.term(route.title)}</ion-label>
          </ion-item>
        `;
      });

    return html`
      <ion-header>
        <ion-item lines="none">
          <ion-avatar slot="start">
            <img src="/images/developer_team/mohammadmahdi_zamanian.jpg" alt="$1" />
          </ion-avatar>
          <ion-label>
            <h4>Mohammad Mahdi Zamanian</h4>
            <h5>mm25zamanian@gmail.com</h5>
          </ion-label>
        </ion-item>
      </ion-header>
      <ion-content fullscreen>
        <ion-list lines="none"> ${navItemsTemplate} </ion-list>
      </ion-content>
    `;
  }
  override requestUpdate(
    name?: PropertyKey | undefined,
    oldValue?: unknown,
    options?: PropertyDeclaration<unknown, unknown> | undefined
  ): void {
    super.requestUpdate(name, oldValue, options);

    if (name === '_activePage') {
      document.querySelector('ion-menu')?.close(true);
    }
  }
}

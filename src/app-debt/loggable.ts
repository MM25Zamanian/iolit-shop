import {createLogger} from '@alwatr/logger';
import {LitElement, PropertyDeclaration} from 'lit';

import type {AlwatrLogger} from '@alwatr/logger/type';
import type {PropertyValues} from 'lit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
type Constructor<ClassType = {}> = new (...args: any[]) => ClassType;

export declare class LoggableMixinInterface extends LitElement {
  protected _logger: AlwatrLogger;
}

export default function LoggableMixin<ClassType extends Constructor<LitElement>>(
  superClass: ClassType
): Constructor<LoggableMixinInterface> & ClassType {
  class LoggableMixinClass extends superClass {
    protected _logger = createLogger(`<${this.tagName.toLowerCase()}>`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this._logger.logMethod('constructor');
    }

    override connectedCallback(): void {
      this._logger.logMethod('connectedCallback');
      super.connectedCallback();
      this.setAttribute('unresolved', '');
    }

    override disconnectedCallback(): void {
      this._logger.logMethod('disconnectedCallback');
      super.disconnectedCallback();
    }

    override requestUpdate(
      name?: PropertyKey | undefined,
      oldValue?: unknown,
      options?: PropertyDeclaration<unknown, unknown> | undefined
    ): void {
      this._logger?.logMethodArgs('requestUpdate', {name, oldValue, options});
      super.requestUpdate(name, oldValue, options);
    }

    protected override firstUpdated(_changedProperties: PropertyValues): void {
      this._logger.logMethod('firstUpdated');
      super.firstUpdated(_changedProperties);
      this.removeAttribute('unresolved');
    }

    override dispatchEvent(event: CustomEvent | Event): boolean {
      this._logger.logMethodArgs('dispatchEvent', {type: event.type});
      return super.dispatchEvent(event);
    }
  }
  return LoggableMixinClass as unknown as Constructor<LoggableMixinInterface> & ClassType;
}

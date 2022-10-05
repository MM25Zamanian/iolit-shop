import {LocalizeController} from '@shoelace-style/localize/dist/index.js';
import {LitElement} from 'lit';

import type {locale} from '../config';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
type Constructor<ClassType = {}> = new (...args: any[]) => ClassType;

export declare class LocalizableMixinInterface extends LitElement {
  protected _localize: LocalizeController;
  protected get _i18nCode(): locale['code'];
}

export default function LocalizableMixin<ClassType extends Constructor<LitElement>>(
  superClass: ClassType
): Constructor<LocalizableMixinInterface> & ClassType {
  class LocalizableMixinClass extends superClass {
    protected _localize = new LocalizeController(this);

    protected get _i18nCode(): locale['code'] {
      return <locale['code']>this._localize.lang();
    }
  }
  return LocalizableMixinClass as unknown as Constructor<LocalizableMixinInterface> & ClassType;
}

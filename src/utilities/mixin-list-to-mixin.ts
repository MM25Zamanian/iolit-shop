import {LitElement} from 'lit';

import type {LocalizableMixinInterface} from '../app-debt/localizable';
import type {LoggableMixinInterface} from '../app-debt/loggable';
import type {SeoMixinInterface} from '../app-debt/seo-friendly';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<ClassType> = new (...args: any[]) => ClassType;

type BaseElement = LocalizableMixinInterface | LoggableMixinInterface | SeoMixinInterface | LitElement;
type BaseElementCallback = Constructor<LocalizableMixinInterface> &
  Constructor<LoggableMixinInterface> &
  Constructor<SeoMixinInterface> &
  typeof LitElement;

export default function mixinListToMixin(
  mixinList: (<ClassType extends Constructor<LitElement>>(
    superClass: ClassType
  ) => Constructor<BaseElement> & ClassType)[]
): BaseElementCallback {
  return mixinList.reduce((perv, curr) => curr(perv), LitElement) as BaseElementCallback;
}

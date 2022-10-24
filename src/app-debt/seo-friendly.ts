import {LitElement, PropertyDeclaration} from 'lit';
import {state} from 'lit/decorators/state.js';

import {updateMeta} from '../utilities/html-meta-manager';

import type {MetaOptions} from '../utilities/html-meta-manager';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
type Constructor<ClassType = {}> = new (...args: any[]) => ClassType;

export declare class SeoMixinInterface extends LitElement {
  protected metaData: MetaOptions;
}

export default function SeoMixin<ClassType extends Constructor<LitElement>>(
  superClass: ClassType
): Constructor<SeoMixinInterface> & ClassType {
  class SeoMixinClass extends superClass {
    @state() protected metaData: MetaOptions = {};

    override requestUpdate(
      name?: PropertyKey | undefined,
      oldValue?: unknown,
      options?: PropertyDeclaration<unknown, unknown> | undefined
    ): void {
      super.requestUpdate(name, oldValue, options);

      if (name === 'metaData') {
        updateMeta({
          ...this.metaData,
          url: window.location.href,
        });
      }
    }
  }
  return SeoMixinClass as unknown as Constructor<SeoMixinInterface> & ClassType;
}

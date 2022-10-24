/* eslint-disable @typescript-eslint/no-unused-vars */
import {Components as _} from '@ionic/core/dist/types/components';
import {Components as __} from 'ionicons/dist/types/components';

import mixinListToMixin from '../utilities/mixin-list-to-mixin';
import StyleSheetsMixin from './base-stylesheets';
import LocalizableMixin from './localizable';
import LoggableMixin from './loggable';
import SeoMixin from './seo-friendly';

const appElementMixinList = [StyleSheetsMixin, LoggableMixin, LocalizableMixin];
const pageElementMixinList = [...appElementMixinList, SeoMixin];

export const AppElement = mixinListToMixin(appElementMixinList);
export const PageElement = mixinListToMixin(pageElementMixinList);

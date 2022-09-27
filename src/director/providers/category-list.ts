import {categoryList} from '../load-data';
import {categoryListSignal} from '../signal';

import type {CategoryInterface} from '../../types/category';

export default async function categoryListProvider(): Promise<Record<string, CategoryInterface>> {
  return await categoryList();
}

categoryListSignal.setProvider(async function (): Promise<Record<string, CategoryInterface>> {
  return await categoryList();
});

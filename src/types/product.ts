import type {ResponsiveImageInterface} from './image';
import type {MultiLanguageNumberType, MultiLanguageStringType} from './language';

export interface ProductInterface {
  _id: string;
  slug: string;
  name: MultiLanguageStringType;
  description: MultiLanguageStringType;
  price: MultiLanguageNumberType;
  image: ResponsiveImageInterface;
  categoryList: string[];
}

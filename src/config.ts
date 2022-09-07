import type {Route} from '@alwatr/router';
import type {TemplateResult} from 'lit';

export type navigation = Record<
  string,
  {
    title: string;
    icon: string;
    render: (route: Route) => TemplateResult;
  }
>;
export type locale = {code: 'fa' | 'en'; dir: 'rtl' | 'ltr'; $code: string};

export const locales: locale[] = [
  {code: 'fa', dir: 'rtl', $code: 'فارسی'},
  {code: 'en', dir: 'ltr', $code: 'English'},
];
export const developerTeam: {name: string; description: string; link?: string; image: string}[] = [
  {
    name: 'mohammadmahdi_zamanian',
    description: 'web_developer_project_maintainer',
    link: 'https://mm25zamanian.ir',
    image: '/images/developer_team/mohammadmahdi_zamanian.jpg',
  },
];

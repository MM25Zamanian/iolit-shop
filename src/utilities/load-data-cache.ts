import {getJson} from '@alwatr/fetch';

import type {FetchOptions} from '@alwatr/fetch';

const fetchCache = new Map<string, unknown>();

export async function loadDataCaching<ResponseType extends Record<string | number, unknown>>(
    url: string,
    queryParameters?: Record<string | number, string | number | boolean>,
    options?: FetchOptions,
): Promise<ResponseType> {
  if (fetchCache.has(url)) {
    return <Promise<ResponseType>>fetchCache.get(url);
  } else {
    const data = getJson<ResponseType>(url, queryParameters, options);

    fetchCache.set(url, data);

    return data;
  }
}

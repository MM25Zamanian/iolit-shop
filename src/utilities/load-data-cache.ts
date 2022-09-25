import {getJson} from '@alwatr/fetch';

import type {FetchOptions} from '@alwatr/fetch';

const fetchCache = new Map<string, unknown>();

/**
 * If the URL is in the cache, return the cached data, otherwise fetch the data and cache it.
 * @param {string} url - The URL to fetch from.
 * @param [queryParameters] - This is an object that contains the query parameters you want to pass to
 * the URL.
 * @param {FetchOptions} [options] - This is an object that can contain the following properties:
 * @returns A promise that resolves to a ResponseType
 */
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

import {getJson} from '@alwatr/fetch';

import type {FetchOptions} from '@alwatr/fetch';

const fetchedDataList = new Map<string, Record<string | number, unknown>>();
const pendingRequestList = new Map<string, Promise<Record<string | number, unknown>>>();

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
  options?: FetchOptions
): Promise<ResponseType> {
  const fetchedData = getFetchedData<ResponseType>(url);
  if (fetchedData) {
    // getPendingRequest<ResponseType>(url).then(async (pendingRequest) => {
    //   if (!pendingRequest) {
    //     return await fetchToGetData<ResponseType>(url, queryParameters, options);
    //   }
    //   return pendingRequest;
    // });

    return fetchedData;
  }

  const pendingRequest = await getPendingRequest<ResponseType>(url);
  if (pendingRequest) {
    return pendingRequest;
  }

  return fetchToGetData<ResponseType>(url, queryParameters, options);
}

/**
 * If the data is already fetched, return it, otherwise fetch it and return the fetched data.
 * @param {string} url - The URL to fetch.
 * @returns A Promise<ResponseType>
 */
function getFetchedData<ResponseType extends Record<string | number, unknown>>(url: string): ResponseType | undefined {
  return <ResponseType | undefined>fetchedDataList.get(url);
}
/**
 * If the data is already fetched, return it, otherwise fetch it and return the fetched data.
 * @param {string} url - The URL to fetch.
 * @returns A promise that resolves to the data fetched from the url.
 */
async function getPendingRequest<ResponseType extends Record<string | number, unknown>>(
  url: string
): Promise<ResponseType | undefined> {
  return (await pendingRequestList.get(url)) as ResponseType | undefined;
}
/**
 * It fetches data from a URL, and returns a promise that resolves to the data
 * @param {string} url - The URL to fetch the data from.
 * @param [queryParameters] - This is an object that contains the query parameters that you want to
 * pass to the URL.
 * @param {FetchOptions} [options] - FetchOptions
 * @returns A promise that resolves to a ResponseType
 */
function fetchToGetData<ResponseType extends Record<string | number, unknown>>(
  url: string,
  queryParameters?: Record<string | number, string | number | boolean>,
  options?: FetchOptions
): Promise<ResponseType> {
  const response = getJson<ResponseType>(url, queryParameters, options).then((jsonData) => {
    fetchedDataList.set(url, jsonData);
    pendingRequestList.delete(url);

    return jsonData;
  });
  pendingRequestList.set(url, response);

  return response;
}

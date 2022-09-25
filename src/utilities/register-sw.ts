import {createLogger} from '@alwatr/logger';
import {SignalInterface} from '@alwatr/signal';

/**
 * It registers a service worker, and if it's successful, it adds a listener to the service worker's
 * update event, and it adds a listener to the signal interface's update event
 * @returns A promise that resolves when the service worker is registered.
 */
export default async function registerSW(): Promise<void> {
  const logger = createLogger('register-sw');
  const signal = new SignalInterface('sw-update');

  if ('serviceWorker' in navigator) {
    return await navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          logger.logMethodArgs('then', {registration: registration});

          registration.addEventListener('updatefound', () => {
            logger.logMethod('updatefound');
          });
          signal.addListener(() => registration.update());
        })
        .catch((error) => logger.error('error', '500', error));
  }
}

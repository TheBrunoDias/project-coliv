/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { defaultCache } from '@serwist/turbopack/worker';
import type { PrecacheEntry, RouteMatchCallbackOptions, RuntimeCaching, SerwistGlobalConfig } from 'serwist';
import { Serwist } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

function matches(matcher: RuntimeCaching['matcher'], options: RouteMatchCallbackOptions): boolean {
  if (matcher instanceof RegExp) return matcher.test(options.url.href);
  if (typeof matcher === 'string') return options.url.href === matcher;
  if (typeof matcher === 'function') return Boolean(matcher(options));
  return false;
}

/**
 * Serwist's defaults, limited to our own origin. Cross-origin requests (Firestore's streaming
 * listen channel, Firebase Auth, Google profile photos) are left to the browser untouched:
 * a caching strategy with a network timeout would break the real-time connection, and
 * Firestore already keeps its own offline cache in IndexedDB.
 */
const runtimeCaching: RuntimeCaching[] = defaultCache.map((entry) => ({
  ...entry,
  matcher: (options) => options.sameOrigin && matches(entry.matcher, options),
}));

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching,
  fallbacks: {
    entries: [
      {
        url: '/~offline',
        matcher({ request }) {
          return request.destination === 'document';
        },
      },
    ],
  },
});

serwist.addEventListeners();

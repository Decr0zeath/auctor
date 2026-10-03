import { defineSite } from './types';

// The home page. The Feeds page (`/?filter=…`) is left alone: it only shows sources you follow.
const HOME = '^/(home\\.php)?(\\?(?!.*\\bfilter=).*)?$';

// The feed sits after a visually hidden "Feed posts" heading and an empty aria-hidden spacer.
// Facebook randomizes class names, so these rely on structure, ARIA, and attributes instead.
const FEED_SECTION = '[role="main"] div:has(> h3 + [aria-hidden="true"] + div)';

export default defineSite({
  site: 'facebook',
  // web.facebook.com is the default host in some regions.
  matches: ['*://www.facebook.com/*', '*://web.facebook.com/*'],
  exitPath: '/',
  surfaces: {
    'facebook.feed': {
      hide: [
        {
          on: HOME,
          selectors: [
            // Checked against the live site on 2026-10-03.
            '[role="main"] h3 + [aria-hidden="true"] + div',
            '[role="main"] div:has(> h3):has([aria-posinset])',
            // Fallbacks: single posts, then markers from older layouts.
            '[role="main"] [aria-posinset]',
            '[role="main"] [role="feed"]',
            '[data-pagelet="MainFeed"]',
          ],
        },
      ],
      replacement: {
        anchor: FEED_SECTION,
        // Inside the column, under the post composer and stories.
        placement: 'before',
        color: 'var(--primary-text)',
        on: HOME,
        search: { action: '/search/top/', param: 'q', placeholder: 'Search Facebook' },
        shortcuts: [
          { label: 'Feeds', href: '/?filter=all&sk=h_chr' },
          { label: 'Groups', href: '/groups/feed/' },
          { label: 'Marketplace', href: '/marketplace/' },
          { label: 'Notifications', href: '/notifications/' },
          { label: 'Messenger', href: '/messages/' },
          { label: 'Events', href: '/events/' },
        ],
        showAnyway: 'Show the feed anyway',
      },
    },
    'facebook.reels': {
      // Reels, and the old Video tab (`/watch`), which now redirects to Reels. A link to a
      // specific video (`/watch/?v=…`) still opens normally.
      gate: '^/(reels?(/|$)|watch/?(\\?(?!.*\\bv=).*)?$)',
    },
  },
});

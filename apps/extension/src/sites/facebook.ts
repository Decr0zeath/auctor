import { defineSite } from './types';

// The home page. The Feeds page (`/?filter=…`) is left alone: it only shows sources you follow.
const HOME = '^/(home\\.php)?(\\?(?!.*\\bfilter=).*)?$';

// The feed sits after a visually hidden "Feed posts" heading and an empty aria-hidden spacer.
// Facebook randomizes class names, so these rely on structure, ARIA, and attributes instead.
const FEED_SECTION = '[role="main"] div:has(> h3 + [aria-hidden="true"] + div)';
// A tab in the top bar, found by where it links so it works in any language. Checked against the
// live site on 2026-10-03: the Menu popover links to the same pages, but it's outside the top
// bar's navigation, so it stays.
const topBarTab = (path: string) =>
  `[role="banner"] [role="navigation"] li:has(a[href^="${path}"])`;

// An item in the home page's left sidebar, found by its link's attribute selectors. The links are
// absolute, and the shortcuts list can hold single groups (`/groups/<id>/`) or games.
const sidebarLink = (attributes: string) => `[role="navigation"] li:has(a${attributes})`;

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
        // The feed's one post, and nothing else to click under the top bar but the way back.
        post: true,
        showAnyway: 'Show the feed anyway',
      },
    },
    'facebook.stories': {
      hide: [
        {
          on: HOME,
          selectors: [
            // The stories row is the only region in the column that links to stories. Checked
            // against the live site on 2026-10-03.
            '[role="main"] [role="region"]:has(a[href*="/stories/"])',
            // Fallback: the row's label, which only matches when Facebook is in English.
            '[role="main"] [role="region"][aria-label="Stories"]',
          ],
        },
      ],
      // The stories viewer, opened from the row or a profile picture. Making your own story
      // (`/stories/create/`) still opens normally.
      gate: '^/stories/(?!create\\b)',
    },
    'facebook.composer': {
      hide: [
        {
          on: HOME,
          // The "What's on your mind?" box: a heading, a link to your profile, then the button
          // that opens the composer. Checked against the live site on 2026-10-03.
          selectors: [
            '[role="main"] [role="region"]:has(> div > h3 + a[role="link"] + [role="button"])',
          ],
        },
      ],
    },
    'facebook.reels': {
      hide: [
        {
          selectors: [
            topBarTab('/reel'),
            // Fallback: the Video tab, which older layouts show instead of Reels.
            topBarTab('/watch'),
          ],
        },
        {
          on: HOME,
          selectors: [sidebarLink('[href*="/reel/"]'), sidebarLink('[href*="/watch/"]')],
        },
      ],
      // Reels, and the old Video tab (`/watch`), which now redirects to Reels. A link to a
      // specific video (`/watch/?v=…`) still opens normally.
      gate: '^/(reels?(/|$)|watch/?(\\?(?!.*\\bv=).*)?$)',
    },
    'facebook.marketplace': {
      hide: [
        { selectors: [topBarTab('/marketplace')] },
        { on: HOME, selectors: [sidebarLink('[href*="/marketplace/"]')] },
      ],
    },
    'facebook.groups': {
      hide: [
        { selectors: [topBarTab('/groups')] },
        {
          on: HOME,
          // The Groups page only, so shortcuts to single groups (`/groups/<id>/`) stay.
          selectors: [sidebarLink('[href$="/groups/"]'), sidebarLink('[href*="/groups/?"]')],
        },
      ],
    },
    'facebook.gaming': {
      hide: [
        { selectors: [topBarTab('/gaming')] },
        // Gaming Video and Play games, under "See more".
        { on: HOME, selectors: [sidebarLink('[href*="/gaming/"]')] },
      ],
    },
    'facebook.search': {
      // The search box, next to the logo. Checked against the live site on 2026-10-03.
      hide: [{ selectors: ['[role="banner"] label:has(input[type="search"])'] }],
    },
    'facebook.sidebar': {
      hide: [
        {
          on: HOME,
          // The sidebar sits next to the main column. Hiding what's inside it, not the sidebar
          // itself, keeps its width, so the main column stays centered. Checked against the live
          // site on 2026-10-03.
          selectors: [':has(> [role="main"]) > [role="navigation"] > *'],
        },
      ],
    },
    'facebook.sponsored': {
      hide: [
        {
          on: HOME,
          selectors: [
            // In the right panel, only ad links carry `attributionsrc` (elsewhere, so does the
            // Meta AI link). The outermost match is the Sponsored section, because its parent
            // also holds the Contacts list. Checked against the live site on 2026-10-03.
            '[role="complementary"] div:has(a[attributionsrc]):not(:has(ul))',
          ],
        },
      ],
    },
    'facebook.contacts': {
      hide: [
        {
          on: HOME,
          // The right panel's sections with a list: Contacts and Group chats. Checked against the
          // live site on 2026-10-03.
          selectors: ['[role="complementary"] [data-visualcompletion="ignore-dynamic"]:has(ul)'],
        },
      ],
    },
  },
});

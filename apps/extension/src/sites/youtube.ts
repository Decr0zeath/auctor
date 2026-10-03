import { defineSite } from './types';

export default defineSite({
  site: 'youtube',
  matches: ['*://www.youtube.com/*'],
  exitPath: '/feed/subscriptions',
  surfaces: {
    'youtube.home-feed': {
      hide: [{ selectors: ['ytd-browse[page-subtype="home"] ytd-rich-grid-renderer'] }],
      replacement: {
        anchor: 'ytd-browse[page-subtype="home"] ytd-two-column-browse-results-renderer #primary',
        search: { action: '/results', param: 'search_query', placeholder: 'Search YouTube' },
        shortcuts: [
          { label: 'Subscriptions', href: '/feed/subscriptions' },
          { label: 'Playlists', href: '/feed/playlists' },
          { label: 'Watch later', href: '/playlist?list=WL' },
          { label: 'History', href: '/feed/history' },
        ],
        showAnyway: 'Show recommendations anyway',
      },
    },
    'youtube.shorts': {
      hide: [
        {
          selectors: [
            // The Shorts tab in the menu. It's the only top entry with no link, because it
            // opens a random Short instead of a page, so this works in any language. Checked
            // against the live site on 2026-10-03, signed in and out.
            'ytd-guide-entry-renderer[is-primary]:has(> a#endpoint:not([href]))',
            // Fallback: its label, which stays "Shorts" in most languages. A channel with that
            // name links to its page, so it stays.
            'ytd-guide-entry-renderer:has(> a#endpoint[title="Shorts"]:not([href]))',
            // The mini menu, on narrower windows, links to it.
            'ytd-mini-guide-entry-renderer:has(> a#endpoint[href^="/shorts"])',
            // Shelves in home, subscriptions, and search results
            'ytd-rich-section-renderer:has(ytd-rich-shelf-renderer[is-shorts])',
            'ytd-reel-shelf-renderer',
            'grid-shelf-view-model:has(ytm-shorts-lockup-view-model)',
            'grid-shelf-view-model:has(ytm-shorts-lockup-view-model-v2)',
            // Single Shorts in search results and in the home and subscription grids. A
            // channel's own Shorts tab is left alone: you chose to open it.
            'ytd-video-renderer:has(a#thumbnail[href^="/shorts/"])',
            'ytd-browse[page-subtype="home"] ytd-rich-item-renderer:has(a[href^="/shorts/"])',
            'ytd-browse[page-subtype="subscriptions"] ytd-rich-item-renderer:has(a[href^="/shorts/"])',
          ],
        },
      ],
      // The Shorts player, opened from a link, a channel's Shorts tab, or the menu in friction
      // mode, which keeps the tab and only adds the prompt.
      gate: '^/shorts(/|$)',
      // A shared Short opens as a normal video: that one video, without the endless swipe.
      redirect: { from: '^/shorts/([\\w-]+)', to: '/watch?v=$1' },
    },
    'youtube.recommendations': {
      hide: [
        {
          selectors: [
            'ytd-watch-flexy #related',
            '.ytp-endscreen-content',
            '.ytp-ce-element',
            '.ytp-fullscreen-grid',
          ],
        },
      ],
    },
  },
});

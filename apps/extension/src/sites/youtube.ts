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
      // The Shorts tab stays in the menu: entering it is a choice, so it gets the prompt instead.
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

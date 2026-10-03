import { defineSite } from './types';

const SEARCH = '^/results';

// The layout YouTube uses for cards and for headers, such as a channel's, or an artist's card in
// search. Its class names come from the component's name, so they're more stable than most.
const METADATA = 'yt-content-metadata-view-model';
const DELIMITER = '.ytContentMetadataViewModelDelimiter';
// A card's views follow a play icon.
const VIEWS = '.ytContentMetadataViewModelLeadingIcon + span[role="text"]';
// A header's second line starts with subscribers, before the number of videos.
const SUBSCRIBERS =
  'yt-page-header-view-model .ytContentMetadataViewModelMetadataRow:not(:first-child) > span[role="text"]:first-child:not(:last-child)';

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
            // Autoplay's switch in the player, which stays off.
            'button[data-tooltip-target-id="ytp-autonav-toggle-button"]',
          ],
        },
      ],
      // Autoplay would play the video Up next showed, so it's switched off. YouTube remembers
      // that, so it stays off until switched back on in the player. Checked against the live
      // site on 2026-10-03.
      switchOff: ['.ytp-autonav-toggle-button[aria-checked="true"]'],
    },
    'youtube.search-shelves': {
      hide: [
        {
          on: SEARCH,
          // Every shelf looks the same, whatever it holds: "Channels new to you", "Popular in"
          // a place, or the latest from a channel you searched for, whose own card stays.
          // Checked against the live site on 2026-10-03.
          selectors: ['ytd-search ytd-shelf-renderer'],
        },
      ],
    },
    'youtube.previews': {
      // The player that starts a video when you point at its thumbnail. Hidden, it would keep
      // playing, muted, so it's paused too. Checked against the live site on 2026-10-03.
      hide: [{ selectors: ['#video-preview'] }],
      pause: ['#video-preview video'],
    },
    'youtube.thumbnails': {
      rewrite: [
        {
          selector: 'img[src*="ytimg.com/vi"]',
          attribute: 'src',
          // The thumbnail the channel chose, and the variants it tests (`hq720_2`), become the
          // frame YouTube takes from the middle of the video. Checked against the live site on
          // 2026-10-03.
          from: '^https://i\\d?\\.ytimg\\.com/vi(?:_webp)?/([\\w-]{11})/(?:hq720|hqdefault|mqdefault|sddefault|maxresdefault)(?!_live)(?:_\\w+)?\\.(?:jpg|webp)(?:\\?.*)?$',
          to: 'https://i.ytimg.com/vi/$1/hq2.jpg',
          // A stream that's live or yet to start has no frames, and gets a 120px placeholder
          // instead, so it keeps its thumbnail.
          minWidth: 200,
        },
      ],
    },
    'youtube.counts': {
      hide: [
        {
          // Counts are found by where they sit, so this works in any language. Checked against
          // the live site on 2026-10-03.
          selectors: [
            // Cards on the home page, subscriptions, channels, and artists' cards in search: the
            // views, the dot after them, and the play icon before them.
            `${METADATA} ${VIEWS}`,
            `${METADATA} ${VIEWS} + ${DELIMITER}`,
            `${METADATA} .ytContentMetadataViewModelLeadingIcon:has(+ span[role="text"])`,
            // Channel and artist headers: subscribers, and the dot after them.
            SUBSCRIBERS,
            `${SUBSCRIBERS} + ${DELIMITER}`,
            // Search results: the views, then the date.
            'ytd-video-renderer #metadata-line > span.inline-metadata-item:not(:last-of-type)',
            // A channel in search results, whose subscribers sit in the field named for videos.
            'ytd-channel-renderer #dot',
            'ytd-channel-renderer #video-count',
            // Video pages: views, in either layout. What follows them is a space, or "watching
            // now" after a live stream's viewers.
            'ytd-watch-info-text #view-count',
            'ytd-watch-info-text #info > span:first-child',
            'ytd-watch-info-text #info > span:first-child + span',
            // Likes, and subscribers.
            'like-button-view-model [class*="ButtonTextContent"]',
            'like-button-view-model [class*="button-text-content"]',
            'ytd-video-owner-renderer #owner-sub-count',
            'ytd-comment-engagement-bar #vote-count-middle',
          ],
        },
      ],
      // In search results the date keeps the dot it had after the views, so it goes too.
      css: 'ytd-video-renderer #metadata-line > span.inline-metadata-item::before { content: none !important; }',
    },
    'youtube.comments': {
      hide: [
        {
          // Checked against the live site on 2026-10-03, down to 900px wide.
          selectors: [
            'ytd-watch-flexy #comments',
            // The chat beside live streams, and its replay.
            'ytd-watch-flexy #chat-container',
            // The comments panel, and the button that opens it, which some layouts use instead.
            'ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-comments-section"]',
            'ytd-comments-entry-point-header-renderer',
          ],
        },
      ],
    },
    'youtube.notifications': {
      // Shown only when signed in. Checked against the live site on 2026-10-03.
      hide: [{ selectors: ['ytd-masthead ytd-notification-topbar-button-renderer'] }],
    },
    'youtube.menu': {
      hide: [
        {
          // The menu, the mini menu that narrower windows show, and the ☰ button that opens
          // either. Checked against the live site on 2026-10-03.
          selectors: [
            'ytd-app tp-yt-app-drawer#guide',
            'ytd-app ytd-mini-guide-renderer',
            'ytd-masthead #guide-button',
          ],
        },
      ],
      // The page keeps room for the menu on its left, so take that back.
      css: 'ytd-app ytd-page-manager { margin-left: 0 !important; }',
    },
  },
});

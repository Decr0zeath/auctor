/**
 * The surface catalogue: the platform-neutral contract shared by the browser extension and,
 * later, the Android app. It names every brain-rot entry point and how strongly it's handled.
 * How a surface is detected is platform-specific and lives elsewhere (see `src/sites`).
 *
 * Surface IDs are permanent once released, because settings files store them.
 */

/** How strongly a surface is handled, from weakest to strongest. */
export const MODES = ['off', 'friction', 'remove'] as const;
export type Mode = (typeof MODES)[number];

/** Higher means stronger protection. */
export const strength = (mode: Mode): number => MODES.indexOf(mode);

export const SITES = {
  youtube: { name: 'YouTube' },
  facebook: { name: 'Facebook' },
} as const;
export type SiteId = keyof typeof SITES;

export interface Surface {
  site: SiteId;
  /** Short label, shown under the site's name in settings. */
  label: string;
  /** Full name, used in the prompt: "Why are you opening {name}?" */
  name: string;
  description: string;
  /** Supported modes, strongest first. */
  modes: readonly Mode[];
  defaultMode: Mode;
}

export const SURFACES = {
  'youtube.home-feed': {
    site: 'youtube',
    label: 'Home feed',
    name: 'the YouTube home feed',
    description: 'The recommendation grid on the home page',
    modes: ['remove', 'off'],
    // Off by default: the home feed is where many people pick background listening, such as
    // lectures, talks, and music.
    defaultMode: 'off',
  },
  'youtube.shorts': {
    site: 'youtube',
    label: 'Shorts',
    name: 'YouTube Shorts',
    description: 'Shorts shelves, and the Shorts player you swipe through',
    modes: ['remove', 'friction', 'off'],
    defaultMode: 'remove',
  },
  'youtube.recommendations': {
    site: 'youtube',
    label: 'Up next',
    name: 'YouTube recommendations',
    description: 'The "Up next" sidebar and end screens on video pages',
    modes: ['remove', 'off'],
    defaultMode: 'remove',
  },
  'facebook.feed': {
    site: 'facebook',
    label: 'News Feed',
    name: 'the Facebook feed',
    description: 'The feed on the home page. The Feeds page, with only sources you follow, stays.',
    modes: ['remove', 'off'],
    defaultMode: 'remove',
  },
  'facebook.stories': {
    site: 'facebook',
    label: 'Stories',
    name: 'Facebook Stories',
    description: 'The stories row (My Day) on the home page, and the stories viewer',
    modes: ['remove', 'friction', 'off'],
    defaultMode: 'remove',
  },
  'facebook.reels': {
    site: 'facebook',
    label: 'Reels',
    name: 'Facebook Reels',
    description:
      'The Reels tab in the top bar, and the Reels player, which the old Video tab opens',
    modes: ['remove', 'friction', 'off'],
    defaultMode: 'remove',
  },
  // The top bar's other tabs. Removing one hides the tab only: the pages still open from search
  // and links, so the top bar can be cut down to Home.
  'facebook.marketplace': {
    site: 'facebook',
    label: 'Marketplace',
    name: 'Facebook Marketplace',
    description:
      'The Marketplace tab in the top bar. Marketplace still opens from search and links.',
    modes: ['remove', 'off'],
    defaultMode: 'remove',
  },
  'facebook.groups': {
    site: 'facebook',
    label: 'Groups',
    name: 'Facebook Groups',
    description: 'The Groups tab in the top bar. Your groups still open from search and links.',
    modes: ['remove', 'off'],
    defaultMode: 'remove',
  },
  'facebook.gaming': {
    site: 'facebook',
    label: 'Gaming',
    name: 'Facebook Gaming',
    description: 'The Gaming tab in the top bar',
    modes: ['remove', 'off'],
    defaultMode: 'remove',
  },
} as const satisfies Record<string, Surface>;

export type SurfaceId = keyof typeof SURFACES;

/** The surfaces that belong to one site. */
export type SurfaceIdOf<S extends SiteId> = {
  [K in SurfaceId]: (typeof SURFACES)[K]['site'] extends S ? K : never;
}[SurfaceId];

export const SURFACE_IDS = Object.keys(SURFACES) as SurfaceId[];

export const isSurfaceId = (id: string): id is SurfaceId => Object.hasOwn(SURFACES, id);

export const surface = (id: SurfaceId): Surface => SURFACES[id];

export const modeIsSupported = (id: SurfaceId, mode: Mode): boolean =>
  surface(id).modes.includes(mode);

export const surfacesOf = (site: SiteId): SurfaceId[] =>
  SURFACE_IDS.filter((id) => SURFACES[id].site === site);

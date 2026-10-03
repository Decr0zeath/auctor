import type { SiteId, SurfaceId, SurfaceIdOf } from '@/catalog/surfaces';

/** A regular expression source, tested against a URL's `pathname + search`. */
export type UrlPattern = string;

export interface HideRule {
  /** CSS selectors for the elements to hide. Each is applied on its own, so one bad selector can't disable the rest. */
  selectors: string[];
  /** Only hide on matching pages. Omit when the selectors are specific enough on their own. */
  on?: UrlPattern;
}

export interface Shortcut {
  label: string;
  href: string;
}

/** A panel shown in place of removed content, offering useful ways out. */
export interface Replacement {
  /** The element the panel is placed relative to. */
  anchor: string;
  /** `inside` (the default) makes the panel the anchor's first child; `before` makes it the anchor's previous sibling. */
  placement?: 'inside' | 'before';
  /** Text color, for sites that set it with variables instead of letting it inherit. */
  color?: string;
  on?: UrlPattern;
  /**
   * Show the post (a quote over a painting) in place of the panel's title. Its button
   * takes the post's wording for giving in, with `showAnyway` as its tooltip.
   */
  post?: boolean;
  search?: { action: string; param: string; placeholder: string };
  shortcuts?: Shortcut[];
  /** Label for the button that reveals the content after the friction prompt. */
  showAnyway: string;
}

export interface Redirect {
  /** Tested on full page loads only, such as opening a shared link. */
  from: UrlPattern;
  /** Target path. `$1`, `$2`, … insert the pattern's capture groups. */
  to: string;
}

/** How one surface is detected and handled in the browser. Which parts apply depends on the mode. */
export interface SurfaceRules {
  /** `remove`: hide these elements. */
  hide?: HideRule[];
  /** `remove`: show this panel where the hidden content was. */
  replacement?: Replacement;
  /** `remove` and `friction`: entering a matching page shows the friction prompt. */
  gate?: UrlPattern;
  /** Any mode except `off`: rewrite matching full page loads. */
  redirect?: Redirect;
}

/** A site's rules, as the engine reads them. */
export interface Site {
  site: SiteId;
  /** Match patterns for the pages the content script runs on. */
  matches: string[];
  /** Where "Go back" leads when the tab has no earlier page to return to. */
  exitPath: string;
  surfaces: Partial<Record<SurfaceId, SurfaceRules>>;
}

/** The shape site files are written in: every catalogue surface of the site needs rules. */
export interface SiteDefinition<S extends SiteId> extends Omit<Site, 'site' | 'surfaces'> {
  site: S;
  surfaces: { [K in SurfaceIdOf<S>]: SurfaceRules };
}

export const defineSite = <S extends SiteId>(definition: SiteDefinition<S>): Site =>
  definition as Site;

export const surfaceRules = (site: Site) =>
  Object.entries(site.surfaces) as [SurfaceId, SurfaceRules][];

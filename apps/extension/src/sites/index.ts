/**
 * The registry of supported sites. To add a site: add its surfaces to the catalogue, write a
 * rules file next to this one, and list it here. Content script matches follow automatically.
 */
import { MatchPattern } from 'wxt/utils/match-patterns';
import facebook from './facebook';
import type { Site } from './types';
import youtube from './youtube';

export const SITE_RULES: readonly Site[] = [youtube, facebook];

export const ALL_MATCHES = SITE_RULES.flatMap((site) => site.matches);

export function siteForUrl(url: string): Site | undefined {
  return SITE_RULES.find((site) =>
    site.matches.some((pattern) => new MatchPattern(pattern).includes(url)),
  );
}

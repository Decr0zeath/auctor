import { SURFACES, SURFACE_IDS } from '@/catalog/surfaces';
import { describe, expect, it } from 'vitest';
import { SITE_RULES, siteForUrl } from '.';
import { defineSite, surfaceRules } from './types';

describe('site rules', () => {
  it('cover every catalogue surface exactly once, under the right site', () => {
    const covered = SITE_RULES.flatMap((site) =>
      surfaceRules(site).map(([id]) => {
        expect(SURFACES[id].site, id).toBe(site.site);
        return id;
      }),
    );
    expect(covered.toSorted()).toEqual(SURFACE_IDS.toSorted());
  });

  it('use valid patterns and selectors', () => {
    for (const site of SITE_RULES) {
      for (const [id, rules] of surfaceRules(site)) {
        const patterns = [
          rules.gate,
          rules.redirect?.from,
          rules.replacement?.on,
          ...(rules.hide ?? []).map((rule) => rule.on),
        ];
        for (const pattern of patterns) {
          if (pattern !== undefined) expect(() => new RegExp(pattern), id).not.toThrow();
        }
        const selectors = [
          ...(rules.hide ?? []).flatMap((rule) => rule.selectors),
          ...(rules.replacement ? [rules.replacement.anchor] : []),
        ];
        for (const selector of selectors) {
          expect(() => document.querySelector(selector), selector).not.toThrow();
        }
      }
    }
  });

  it('find the site for a URL', () => {
    expect(siteForUrl('https://www.youtube.com/shorts/abc')?.site).toBe('youtube');
    expect(siteForUrl('https://web.facebook.com/')?.site).toBe('facebook');
    expect(siteForUrl('https://example.com/')).toBeUndefined();
  });

  it('require rules for every surface of a site', () => {
    const surfaces = { 'youtube.home-feed': {} };
    // @ts-expect-error: youtube.shorts and youtube.recommendations are missing.
    defineSite({ site: 'youtube', matches: [], exitPath: '/', surfaces });
  });
});

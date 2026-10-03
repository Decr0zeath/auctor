/**
 * Decides what to do on a page, given a site's rules, the user's modes, and any active passes.
 * Pure, so the rules can be tested without a browser.
 */
import type { Mode, SurfaceId } from '@/catalog/surfaces';
import { surfaceRules } from '@/sites/types';
import type { Replacement, Rewrite, Site, UrlPattern } from '@/sites/types';

/** When each surface's pass runs out, as a timestamp. */
export type Passes = Partial<Record<SurfaceId, number>>;

export interface PageInput {
  /** The page's `pathname + search`. */
  path: string;
  modeOf: (id: SurfaceId) => Mode;
  passes: Passes;
  now: number;
}

export interface Plan {
  /** Selectors to hide. */
  hide: string[];
  /** Extra CSS, for what hiding leaves behind. */
  css: string[];
  rewrite: Rewrite[];
  /** Media to pause whenever it plays. */
  pause: string[];
  /** Switches to turn off whenever they're on. */
  switchOff: string[];
  replacements: { surface: SurfaceId; replacement: Replacement }[];
  /** The surface this page belongs to, if that surface sits behind the friction prompt. */
  gated: SurfaceId | null;
  /** Whether the prompt should show now: the page is gated and there's no active pass. */
  prompt: boolean;
  /** When the earliest active pass runs out, so the plan can be recomputed then. */
  passEndsAt: number | null;
}

const patterns = new Map<UrlPattern, RegExp>();

function pattern(source: UrlPattern): RegExp {
  let regex = patterns.get(source);
  if (!regex) patterns.set(source, (regex = new RegExp(source)));
  return regex;
}

const matches = (source: UrlPattern | undefined, path: string): boolean =>
  source === undefined || pattern(source).test(path);

export function planPage(site: Site, { path, modeOf, passes, now }: PageInput): Plan {
  const plan: Plan = {
    hide: [],
    css: [],
    rewrite: [],
    pause: [],
    switchOff: [],
    replacements: [],
    gated: null,
    prompt: false,
    passEndsAt: null,
  };

  for (const [id, rules] of surfaceRules(site)) {
    const mode = modeOf(id);
    if (mode === 'off') continue;

    const passEnd = passes[id] ?? 0;
    const passed = passEnd > now;
    if (passed) plan.passEndsAt = Math.min(plan.passEndsAt ?? Infinity, passEnd);

    if (rules.gate !== undefined && plan.gated === null && matches(rules.gate, path)) {
      plan.gated = id;
      plan.prompt = !passed;
    }

    if (mode !== 'remove' || passed) continue;
    for (const rule of rules.hide ?? []) {
      if (matches(rule.on, path)) plan.hide.push(...rule.selectors);
    }
    if (rules.css) plan.css.push(rules.css);
    plan.rewrite.push(...(rules.rewrite ?? []));
    plan.pause.push(...(rules.pause ?? []));
    plan.switchOff.push(...(rules.switchOff ?? []));
    if (rules.replacement && matches(rules.replacement.on, path)) {
      plan.replacements.push({ surface: id, replacement: rules.replacement });
    }
  }
  return plan;
}

/** Where a full page load should go instead, such as a shared Short opening as a normal video. */
export function redirectFor(
  site: Site,
  { path, modeOf }: Pick<PageInput, 'path' | 'modeOf'>,
): string | null {
  for (const [id, rules] of surfaceRules(site)) {
    if (!rules.redirect || modeOf(id) === 'off') continue;
    const match = pattern(rules.redirect.from).exec(path);
    if (!match) continue;
    return rules.redirect.to.replace(/\$(\d)/g, (_, group) => match[Number(group)] ?? '');
  }
  return null;
}

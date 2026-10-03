/**
 * What a site's rules do to a page besides hiding: rewriting attributes, pausing media, and
 * turning switches off. Sites re-render often, so each keeps itself applied as the page changes.
 */
import type { Rewrite } from '@/sites/types';

/** Runs `check` now, then once per frame while the page keeps changing. */
function watchPage(check: () => void) {
  let frame = 0;
  const observer = new MutationObserver(() => {
    frame ||= requestAnimationFrame(() => {
      frame = 0;
      check();
    });
  });
  return {
    start(options: MutationObserverInit) {
      observer.observe(document, { childList: true, subtree: true, ...options });
      check();
    },
    stop() {
      observer.disconnect();
      cancelAnimationFrame(frame);
      frame = 0;
    },
  };
}

// A bad selector matches nothing, so it can't break the rest.
function queryAll(selector: string): Element[] {
  try {
    return [...document.querySelectorAll(selector)];
  } catch {
    return [];
  }
}

function matches(element: Element, selector: string): boolean {
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

const sameList = <T>(a: readonly T[], b: readonly T[]) =>
  a.length === b.length && a.every((item, i) => item === b[i]);

export function createRewriter() {
  let rules: Rewrite[] = [];
  const patterns = new Map<Rewrite, RegExp>();
  /** What each rewritten attribute was, and what it became, so it can be put back. */
  const rewritten = new WeakMap<Element, Map<string, { original: string; value: string }>>();
  /** Values whose new image loaded too small, which are left as they are. */
  const kept = new Set<string>();

  const apply = () => {
    for (const rule of rules) {
      let pattern = patterns.get(rule);
      if (!pattern) patterns.set(rule, (pattern = new RegExp(rule.from)));
      for (const element of queryAll(rule.selector)) {
        const original = element.getAttribute(rule.attribute);
        if (original === null || kept.has(original) || !pattern.test(original)) continue;
        const value = original.replace(pattern, rule.to);
        if (value === original) continue;
        let changes = rewritten.get(element);
        if (!changes) rewritten.set(element, (changes = new Map()));
        changes.set(rule.attribute, { original, value });
        element.setAttribute(rule.attribute, value);
        if (rule.minWidth !== undefined && element instanceof HTMLImageElement) {
          const { minWidth } = rule;
          const check = () => {
            if (element.getAttribute(rule.attribute) !== value) return;
            if (element.naturalWidth >= minWidth) return;
            kept.add(original);
            element.setAttribute(rule.attribute, original);
          };
          element.addEventListener('load', check, { once: true });
        }
      }
    }
  };
  const watcher = watchPage(apply);

  /** Puts back what the old rules changed, unless the page has set something else since. */
  const revert = (old: Rewrite[]) => {
    for (const rule of old) {
      for (const element of queryAll(rule.selector)) {
        const change = rewritten.get(element)?.get(rule.attribute);
        if (change && element.getAttribute(rule.attribute) === change.value) {
          element.setAttribute(rule.attribute, change.original);
        }
        rewritten.get(element)?.delete(rule.attribute);
      }
    }
  };

  const set = (next: Rewrite[]) => {
    if (sameList(next, rules)) return;
    watcher.stop();
    revert(rules.filter((rule) => !next.includes(rule)));
    rules = next;
    if (rules.length === 0) return;
    const attributes = [...new Set(rules.map((rule) => rule.attribute))];
    watcher.start({ attributes: true, attributeFilter: attributes });
  };

  return { set, remove: () => set([]) };
}

export function createPauser() {
  let selectors: string[] = [];

  // `play` doesn't bubble, so it's caught on its way down.
  const onPlay = (event: Event) => {
    const media = event.target;
    if (!(media instanceof HTMLMediaElement)) return;
    if (selectors.some((selector) => matches(media, selector))) media.pause();
  };

  const set = (next: string[]) => {
    if (sameList(next, selectors)) return;
    selectors = next;
    if (selectors.length === 0) {
      document.removeEventListener('play', onPlay, true);
      return;
    }
    document.addEventListener('play', onPlay, true);
    for (const selector of selectors) {
      for (const media of queryAll(selector)) {
        if (media instanceof HTMLMediaElement) media.pause();
      }
    }
  };

  return { set, remove: () => set([]) };
}

/** How long a switch that stays on after a click is left alone, so a page that refuses can't loop. */
const RETRY_MS = 1000;

export function createSwitcher() {
  let selectors: string[] = [];
  const clickedAt = new WeakMap<Element, number>();

  const check = () => {
    const now = Date.now();
    for (const selector of selectors) {
      for (const element of queryAll(selector)) {
        if (now - (clickedAt.get(element) ?? -Infinity) < RETRY_MS) continue;
        clickedAt.set(element, now);
        if (element instanceof HTMLElement) element.click();
      }
    }
  };
  const watcher = watchPage(check);

  const set = (next: string[]) => {
    if (sameList(next, selectors)) return;
    watcher.stop();
    selectors = next;
    // Switches show their state through ARIA, so those are the attributes to watch.
    if (selectors.length) {
      watcher.start({ attributes: true, attributeFilter: ['aria-checked', 'aria-pressed'] });
    }
  };

  return { set, remove: () => set([]) };
}

/** Small DOM helpers shared by the engine's page UI. */

type Attributes = Record<string, string | boolean | undefined>;
type Child = Node | string | null | undefined | false;

export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attributes: Attributes = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);
  for (const [name, value] of Object.entries(attributes)) {
    if (value === true) element.setAttribute(name, '');
    else if (typeof value === 'string') element.setAttribute(name, value);
  }
  for (const child of children) if (child) element.append(child);
  return element;
}

/**
 * Creates a host element with a shadow root, so the page's styles can't reach in. It's open so
 * tests can see inside; actions that matter only accept trusted (real user) events.
 */
export function shadowHost(name: string, css: string): { host: HTMLElement; root: ShadowRoot } {
  const host = document.createElement(`auctor-${name}`);
  const root = host.attachShadow({ mode: 'open' });
  root.append(h('style', {}, css));
  return { host, root };
}

/**
 * Keeps a stylesheet that hides the given selectors, one rule each so a bad selector can't break
 * the rest, followed by any extra CSS.
 */
export function createHider() {
  const style = document.createElement('style');
  style.dataset.auctor = 'hide';

  return {
    set(selectors: string[], extra: string[] = []) {
      const css = [
        ...selectors.map((selector) => `${selector} { display: none !important; }`),
        ...extra,
      ].join('\n');
      if (style.textContent !== css) style.textContent = css;
      // At document_start there's no <head> yet; <html> works just as well.
      if (!style.isConnected) (document.head ?? document.documentElement).append(style);
    },
    remove() {
      style.remove();
    },
  };
}

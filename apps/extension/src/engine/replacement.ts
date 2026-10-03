/**
 * Panels shown where removed content used to be, with search and shortcuts to the useful parts
 * of the site. Sites re-render often, so panels are re-attached whenever their anchor changes.
 */
import { copy } from '@/catalog/copy';
import { surface } from '@/catalog/surfaces';
import type { SurfaceId } from '@/catalog/surfaces';
import type { Replacement } from '@/sites/types';
import { h, shadowHost } from './dom';
import css from './panel.css?inline';

export interface ShownReplacement {
  surface: SurfaceId;
  replacement: Replacement;
}

export function createReplacements(onShowAnyway: (id: SurfaceId) => void) {
  const shown = new Map<SurfaceId, { replacement: Replacement; host: HTMLElement }>();
  let frame = 0;

  const attachAll = () => {
    frame = 0;
    for (const { replacement, host } of shown.values()) {
      const anchor = document.querySelector(replacement.anchor);
      if (!anchor) continue;
      if (replacement.placement === 'before') {
        if (anchor.previousSibling !== host) anchor.before(host);
      } else if (host.parentNode !== anchor) {
        anchor.prepend(host);
      }
    }
  };
  const observer = new MutationObserver(() => {
    frame ||= requestAnimationFrame(attachAll);
  });

  const set = (list: ShownReplacement[]) => {
    for (const [id, entry] of shown) {
      if (list.some((item) => item.surface === id && item.replacement === entry.replacement)) {
        continue;
      }
      entry.host.remove();
      shown.delete(id);
    }
    for (const { surface: id, replacement } of list) {
      if (!shown.has(id)) {
        shown.set(id, { replacement, host: renderPanel(id, replacement, onShowAnyway) });
      }
    }
    if (shown.size === 0) {
      observer.disconnect();
      return;
    }
    observer.observe(document, { childList: true, subtree: true });
    attachAll();
  };

  return { set, remove: () => set([]) };
}

function renderPanel(
  id: SurfaceId,
  replacement: Replacement,
  onShowAnyway: (id: SurfaceId) => void,
): HTMLElement {
  const { host, root } = shadowHost('panel', css);
  const { search, shortcuts } = replacement;
  if (replacement.color) host.style.color = replacement.color;

  const showAnyway = h('button', { class: 'show-anyway', type: 'button' }, replacement.showAnyway);
  showAnyway.addEventListener('click', () => onShowAnyway(id));

  root.append(
    h(
      'section',
      { class: 'panel', 'aria-label': 'Auctor' },
      h('p', { class: 'title' }, copy.removedTitle(surface(id).name)),
      search &&
        h(
          'form',
          { class: 'search', role: 'search', action: search.action, method: 'get' },
          h('input', {
            type: 'search',
            name: search.param,
            placeholder: search.placeholder,
            'aria-label': search.placeholder,
          }),
          h('button', { type: 'submit' }, 'Search'),
        ),
      h(
        'nav',
        { class: 'shortcuts' },
        ...shortcuts.map(({ label, href }) => h('a', { href }, label)),
      ),
      showAnyway,
    ),
  );

  // Keep typing in the panel from triggering the site's keyboard shortcuts.
  for (const type of ['keydown', 'keyup', 'keypress']) {
    host.addEventListener(type, (event) => event.stopPropagation());
  }
  return host;
}

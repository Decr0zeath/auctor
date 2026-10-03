/**
 * Panels shown where removed content used to be: search and shortcuts to the useful parts of the
 * site, or the post. Sites re-render often, so panels are re-attached whenever their anchor
 * changes, and a panel with the post is drawn again when the next post is up.
 */
import { copy } from '@/catalog/copy';
import { postFor, postNumber } from '@/catalog/posts';
import { surface } from '@/catalog/surfaces';
import type { SurfaceId } from '@/catalog/surfaces';
import type { Replacement } from '@/sites/types';
import { h, shadowHost } from './dom';
import css from './panel.css?inline';
import { postCss, renderPost } from './post';

export interface ShownReplacement {
  surface: SurfaceId;
  replacement: Replacement;
}

export function createReplacements(onShowAnyway: (id: SurfaceId) => void) {
  const shown = new Map<
    SurfaceId,
    { replacement: Replacement; host: HTMLElement; postNumber: number }
  >();
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

  const set = (list: ShownReplacement[], now = new Date()) => {
    const current = postNumber(now);
    for (const [id, entry] of shown) {
      const kept = list.some(
        (item) => item.surface === id && item.replacement === entry.replacement,
      );
      if (kept && (!entry.replacement.post || entry.postNumber === current)) continue;
      entry.host.remove();
      shown.delete(id);
    }
    for (const { surface: id, replacement } of list) {
      if (!shown.has(id)) {
        const host = renderPanel(id, replacement, onShowAnyway, now);
        shown.set(id, { replacement, host, postNumber: current });
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
  now: Date,
): HTMLElement {
  const { post, search, shortcuts } = replacement;
  const { host, root } = shadowHost('panel', post ? css + postCss : css);
  if (post) host.classList.add('with-post');
  if (replacement.color) host.style.color = replacement.color;

  const title = copy.removedTitle(surface(id).name);
  const searchForm =
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
    );
  const links = shortcuts?.length
    ? h(
        'nav',
        { class: 'shortcuts' },
        ...shortcuts.map(({ label, href }) => h('a', { href }, label)),
      )
    : null;
  const current = post ? postFor(now) : null;
  const showAnyway = h(
    'button',
    // With the post, the button gives in in the post's words, and its tooltip says what it does.
    { class: 'show-anyway', type: 'button', title: current ? replacement.showAnyway : undefined },
    current?.giveIn.label ?? replacement.showAnyway,
  );
  showAnyway.addEventListener('click', () => onShowAnyway(id));

  root.append(
    current
      ? // The post takes the title's place, with the ways out kept quiet underneath it.
        h(
          'section',
          { class: 'panel with-post', 'aria-label': title },
          renderPost(current),
          searchForm,
          h('div', { class: 'footer' }, links, showAnyway),
        )
      : h(
          'section',
          { class: 'panel', 'aria-label': 'Auctor' },
          h('p', { class: 'title' }, title),
          searchForm,
          links,
          showAnyway,
        ),
  );

  // Keep typing in the panel from triggering the site's keyboard shortcuts.
  for (const type of ['keydown', 'keyup', 'keypress']) {
    host.addEventListener(type, (event) => event.stopPropagation());
  }
  return host;
}

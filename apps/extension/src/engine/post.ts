/**
 * The post: a quote over a painting, drawn at the top of a replacement panel. The images and
 * fonts ship with the extension, so showing it makes no network requests.
 */
import type { Post } from '@/catalog/posts';
import { browser } from 'wxt/browser';
import type { PublicPath } from 'wxt/browser';
import { h } from './dom';
import css from './post.css?inline';

export { css as postCss };

export function renderPost({ quote, painting }: Post): HTMLElement {
  loadFonts();
  const image = h('img', {
    src: browser.runtime.getURL(`/posts/${painting.id}.webp` as PublicPath),
    alt: '',
    decoding: 'async',
  });
  image.addEventListener('load', () => image.classList.add('loaded'), { once: true });

  return h(
    'figure',
    { class: 'post' },
    image,
    h('blockquote', { class: 'quote' }, h('p', {}, quote.text), h('cite', {}, quote.by)),
    h('figcaption', { class: 'credit' }, `${painting.artist}, ${painting.title}, ${painting.year}`),
  );
}

/** Declares the fonts on the page itself, because Chrome ignores `@font-face` in shadow roots. */
function loadFonts() {
  if (document.querySelector('style[data-auctor="fonts"]')) return;
  const style = document.createElement('style');
  style.dataset.auctor = 'fonts';
  style.textContent = [
    fontFace('Auctor Cormorant', '/fonts/cormorant-garamond.woff2', '300 700'),
    fontFace('Auctor Cinzel', '/fonts/cinzel.woff2', '400 700'),
  ].join('\n');
  (document.head ?? document.documentElement).append(style);
}

const fontFace = (family: string, path: PublicPath, weight: string) =>
  `@font-face { font-family: '${family}'; src: url('${browser.runtime.getURL(path)}') format('woff2'); font-weight: ${weight}; font-display: block; }`;

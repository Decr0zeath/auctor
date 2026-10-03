/**
 * The friction prompt: a full-screen pause that asks why you're opening a surface, with
 * "Go back" as the main action and "Continue" unlocking after a short wait.
 */
import { copy } from '@/catalog/copy';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { h, shadowHost } from './dom';
import css from './gate.css?inline';

export interface Prompt {
  /** Identifies the prompt, so showing the same prompt again doesn't restart its countdown. */
  key: string;
  title: string;
  question?: string;
  waitSeconds: number;
  passMinutes: number;
  onGoBack: () => void;
  onContinue: () => void;
}

export function createGate(ctx: ContentScriptContext) {
  let open: { key: string; close: () => void } | null = null;

  const close = () => {
    open?.close();
    open = null;
  };

  return {
    show(prompt: Prompt) {
      if (open?.key === prompt.key) return;
      close();
      open = { key: prompt.key, close: render(ctx, prompt) };
    },
    close,
  };
}

/** Renders the prompt and returns a function that removes it. */
function render(ctx: ContentScriptContext, prompt: Prompt): () => void {
  const controller = new AbortController();
  const { signal } = controller;
  const { host, root } = shadowHost('gate', css);

  const goBack = h('button', { class: 'go-back', type: 'button' }, copy.goBack);
  const proceed = h(
    'button',
    { class: 'continue', type: 'button', disabled: true },
    copy.continueIn(prompt.waitSeconds),
  );
  root.append(
    h(
      'div',
      { class: 'backdrop', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'title' },
      h(
        'div',
        { class: 'card' },
        h('h1', { id: 'title' }, prompt.title),
        prompt.question && h('p', { class: 'question' }, prompt.question),
        h('div', { class: 'actions' }, goBack, proceed),
        h('p', { class: 'footer' }, copy.promptFooter),
      ),
    ),
  );
  goBack.addEventListener('click', () => prompt.onGoBack(), { signal });
  // Only a real click counts, so a page script can't continue on the user's behalf.
  proceed.addEventListener('click', (event) => event.isTrusted && prompt.onContinue(), { signal });

  // The wait only counts down while the tab is visible.
  let remaining = prompt.waitSeconds;
  const countdown = ctx.setInterval(() => {
    if (document.visibilityState !== 'visible') return;
    remaining -= 1;
    if (remaining > 0) {
      proceed.textContent = copy.continueIn(remaining);
      return;
    }
    clearInterval(countdown);
    proceed.disabled = false;
    proceed.textContent = copy.continueFor(prompt.passMinutes);
  }, 1000);

  // Keep the page behind the prompt still and silent: no keyboard shortcuts, scrolling, or playback.
  const guardKeys = (event: Event) => {
    event.stopImmediatePropagation();
    if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Escape') {
      prompt.onGoBack();
    } else if (!event.composedPath().includes(host)) {
      event.preventDefault();
      goBack.focus();
    }
  };
  for (const type of ['keydown', 'keyup', 'keypress']) {
    window.addEventListener(type, guardKeys, { capture: true, signal });
  }
  const preventDefault = (event: Event) => event.preventDefault();
  host.addEventListener('wheel', preventDefault, { passive: false, signal });
  host.addEventListener('touchmove', preventDefault, { passive: false, signal });
  const pauseMedia = (event: Event) => {
    if (event.target instanceof HTMLMediaElement) event.target.pause();
  };
  document.addEventListener('play', pauseMedia, { capture: true, signal });

  // The prompt can open before <body> exists, so keep checking for it, and for media that starts late.
  let inertBody: HTMLElement | null = null;
  const holdPage = () => {
    if (!inertBody && document.body) {
      inertBody = document.body;
      inertBody.inert = true;
    }
    for (const media of document.querySelectorAll<HTMLMediaElement>('video, audio')) media.pause();
  };
  holdPage();
  const holding = ctx.setInterval(holdPage, 250);

  // Outside <body>, so making the page inert doesn't affect the prompt.
  document.documentElement.append(host);
  goBack.focus();

  return () => {
    controller.abort();
    clearInterval(countdown);
    clearInterval(holding);
    if (inertBody) inertBody.inert = false;
    host.remove();
  };
}

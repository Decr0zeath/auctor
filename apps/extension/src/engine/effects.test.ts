import type { Rewrite } from '@/sites/types';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createPauser, createRewriter, createSwitcher } from './effects';

/** Lets the page's changes reach the observers, which batch them by frame. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 50));

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const remove of cleanup.splice(0)) remove();
  document.body.innerHTML = '';
});

describe('rewriting', () => {
  const frame: Rewrite = {
    selector: 'img',
    attribute: 'src',
    from: '^https://img\\.test/(\\w+)/chosen\\.jpg$',
    to: 'https://img.test/$1/frame.jpg',
  };
  const image = (src: string) => {
    const img = document.createElement('img');
    img.setAttribute('src', src);
    document.body.append(img);
    return img;
  };
  const start = (rules: Rewrite[]) => {
    const rewriter = createRewriter();
    cleanup.push(rewriter.remove);
    rewriter.set(rules);
    return rewriter;
  };

  it('rewrites what matches, now and whenever the page sets it again', async () => {
    const first = image('https://img.test/a/chosen.jpg');
    const other = image('https://img.test/a/avatar.jpg');
    start([frame]);
    expect(first.getAttribute('src')).toBe('https://img.test/a/frame.jpg');
    expect(other.getAttribute('src')).toBe('https://img.test/a/avatar.jpg');

    const later = image('https://img.test/b/chosen.jpg');
    first.setAttribute('src', 'https://img.test/c/chosen.jpg');
    await settle();
    expect(later.getAttribute('src')).toBe('https://img.test/b/frame.jpg');
    expect(first.getAttribute('src')).toBe('https://img.test/c/frame.jpg');
  });

  it('puts things back when turned off, unless the page has changed them since', () => {
    const kept = image('https://img.test/a/chosen.jpg');
    const changed = image('https://img.test/b/chosen.jpg');
    const rewriter = start([frame]);
    changed.setAttribute('src', 'https://img.test/b/new.jpg');

    rewriter.set([]);
    expect(kept.getAttribute('src')).toBe('https://img.test/a/chosen.jpg');
    expect(changed.getAttribute('src')).toBe('https://img.test/b/new.jpg');
  });

  it('keeps the original when the new image loads too small', async () => {
    const img = image('https://img.test/a/chosen.jpg');
    start([{ ...frame, minWidth: 200 }]);
    expect(img.getAttribute('src')).toBe('https://img.test/a/frame.jpg');

    // A missing frame loads as a small placeholder.
    Object.defineProperty(img, 'naturalWidth', { value: 120, configurable: true });
    img.dispatchEvent(new Event('load'));
    expect(img.getAttribute('src')).toBe('https://img.test/a/chosen.jpg');

    await settle();
    expect(img.getAttribute('src')).toBe('https://img.test/a/chosen.jpg');
  });
});

describe('pausing', () => {
  it('pauses matching media whenever it starts playing', () => {
    document.body.innerHTML = '<div id="preview"><video></video></div><video id="main"></video>';
    const [preview, main] = [...document.querySelectorAll('video')] as HTMLVideoElement[];
    const paused = [vi.spyOn(preview!, 'pause'), vi.spyOn(main!, 'pause')];
    const pauser = createPauser();
    cleanup.push(pauser.remove);
    pauser.set(['#preview video']);
    paused[0]!.mockClear();

    preview!.dispatchEvent(new Event('play'));
    main!.dispatchEvent(new Event('play'));
    expect(paused[0]).toHaveBeenCalledOnce();
    expect(paused[1]).not.toHaveBeenCalled();

    pauser.set([]);
    preview!.dispatchEvent(new Event('play'));
    expect(paused[0]).toHaveBeenCalledOnce();
  });
});

describe('switching off', () => {
  /** A switch that turns off when clicked, like YouTube's autoplay. */
  const toggle = (on: boolean) => {
    const element = document.createElement('div');
    element.className = 'toggle';
    element.setAttribute('aria-checked', String(on));
    element.addEventListener('click', () => {
      const checked = element.getAttribute('aria-checked') === 'true';
      element.setAttribute('aria-checked', String(!checked));
    });
    document.body.append(element);
    return element;
  };

  it('turns switches off when they appear, and leaves them off', async () => {
    const shown = toggle(true);
    const off = toggle(false);
    const switcher = createSwitcher();
    cleanup.push(switcher.remove);
    switcher.set(['.toggle[aria-checked="true"]']);
    expect(shown.getAttribute('aria-checked')).toBe('false');
    expect(off.getAttribute('aria-checked')).toBe('false');

    const later = toggle(true);
    await settle();
    expect(later.getAttribute('aria-checked')).toBe('false');
    expect(shown.getAttribute('aria-checked')).toBe('false');
  });

  it("doesn't keep clicking a switch the page won't turn off", async () => {
    const stuck = document.createElement('div');
    stuck.setAttribute('aria-checked', 'true');
    const clicks = vi.fn();
    stuck.addEventListener('click', clicks);
    document.body.append(stuck);
    const switcher = createSwitcher();
    cleanup.push(switcher.remove);
    switcher.set(['[aria-checked="true"]']);

    document.body.append(document.createElement('p'));
    await settle();
    expect(clicks).toHaveBeenCalledOnce();
  });
});

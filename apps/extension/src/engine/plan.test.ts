import { surface } from '@/catalog/surfaces';
import type { Mode, SurfaceId } from '@/catalog/surfaces';
import facebook from '@/sites/facebook';
import youtube from '@/sites/youtube';
import { describe, expect, it } from 'vitest';
import { planPage, redirectFor } from './plan';
import type { Passes } from './plan';

const NOW = 1_700_000_000_000;

function input(path: string, modes: Partial<Record<SurfaceId, Mode>> = {}, passes: Passes = {}) {
  return {
    path,
    modeOf: (id: SurfaceId) => modes[id] ?? surface(id).defaultMode,
    passes,
    now: NOW,
  };
}

describe('YouTube', () => {
  it('leaves the home feed alone by default', () => {
    const plan = planPage(youtube, input('/'));
    expect(plan.hide).not.toContain('ytd-browse[page-subtype="home"] ytd-rich-grid-renderer');
    expect(plan.replacements).toEqual([]);
  });

  it('removes the home feed and offers a replacement panel when asked to', () => {
    const plan = planPage(youtube, input('/', { 'youtube.home-feed': 'remove' }));
    expect(plan.hide).toContain('ytd-browse[page-subtype="home"] ytd-rich-grid-renderer');
    expect(plan.replacements.map((item) => item.surface)).toEqual(['youtube.home-feed']);
    expect(plan.gated).toBeNull();
  });

  it('puts the Shorts player behind the prompt', () => {
    for (const path of ['/shorts/', '/shorts/abc123', '/shorts']) {
      expect(planPage(youtube, input(path))).toMatchObject({
        gated: 'youtube.shorts',
        prompt: true,
      });
    }
    expect(planPage(youtube, input('/feed/shorts-like-page')).gated).toBeNull();
  });

  it('lifts everything for a surface while its pass lasts', () => {
    const passes = { 'youtube.shorts': NOW + 60_000 };
    const plan = planPage(youtube, input('/shorts/abc', {}, passes));
    expect(plan).toMatchObject({
      gated: 'youtube.shorts',
      prompt: false,
      passEndsAt: NOW + 60_000,
    });
    expect(plan.hide).not.toContain('ytd-reel-shelf-renderer');
  });

  it('ignores expired passes', () => {
    const plan = planPage(youtube, input('/shorts/abc', {}, { 'youtube.shorts': NOW - 1 }));
    expect(plan).toMatchObject({ prompt: true, passEndsAt: null });
  });

  it('only gates, without hiding, in friction mode', () => {
    const plan = planPage(youtube, input('/shorts/abc', { 'youtube.shorts': 'friction' }));
    expect(plan.prompt).toBe(true);
    expect(plan.hide).not.toContain('ytd-reel-shelf-renderer');
  });

  it('does nothing for a surface that is off', () => {
    const off = {
      'youtube.home-feed': 'off',
      'youtube.shorts': 'off',
      'youtube.recommendations': 'off',
    } as const;
    expect(planPage(youtube, input('/shorts/abc', off))).toEqual({
      hide: [],
      replacements: [],
      gated: null,
      prompt: false,
      passEndsAt: null,
    });
  });

  it('opens shared Shorts as normal videos', () => {
    expect(redirectFor(youtube, input('/shorts/abc-_123?feature=share'))).toBe('/watch?v=abc-_123');
    expect(redirectFor(youtube, input('/shorts/'))).toBeNull();
    expect(redirectFor(youtube, input('/shorts/abc', { 'youtube.shorts': 'friction' }))).toBe(
      '/watch?v=abc',
    );
    expect(redirectFor(youtube, input('/shorts/abc', { 'youtube.shorts': 'off' }))).toBeNull();
  });
});

describe('Facebook', () => {
  it('removes the feed on the home page only', () => {
    for (const path of ['/', '/?sk=h_chr', '/home.php']) {
      const plan = planPage(facebook, input(path));
      expect(plan.hide, path).toContain('[role="main"] h3 + [aria-hidden="true"] + div');
      expect(
        plan.replacements.map((item) => item.surface),
        path,
      ).toEqual(['facebook.feed']);
    }
  });

  it('leaves the Feeds page and the rest of the site alone', () => {
    for (const path of [
      '/?filter=all&sk=h_chr',
      '/?sk=h_chr&filter=favorites',
      '/groups/feed/',
      '/marketplace/',
    ]) {
      const plan = planPage(facebook, input(path));
      // Only the top bar's search bar and tabs, which are removed on every page. The side
      // panels stay too.
      const hidden = plan.hide.filter((selector) => !selector.startsWith('[role="banner"]'));
      expect(hidden, path).toEqual([]);
      expect(plan.replacements, path).toEqual([]);
    }
  });

  const tab = (path: string) => `[role="banner"] [role="navigation"] li:has(a[href^="${path}"])`;

  it('removes the search bar and every top bar tab but Home, on every page', () => {
    for (const path of ['/', '/groups/feed/', '/marketplace/', '/profile.php?id=4']) {
      const { hide } = planPage(facebook, input(path));
      for (const href of ['/reel', '/marketplace', '/groups', '/gaming']) {
        expect(hide, `${path} ${href}`).toContain(tab(href));
      }
      expect(hide, path).not.toContain(tab('/'));
      expect(hide, path).toContain('[role="banner"] label:has(input[type="search"])');
    }
  });

  it('keeps a top bar tab that is off, and the Reels tab in friction mode', () => {
    const modes = { 'facebook.groups': 'off', 'facebook.reels': 'friction' } as const;
    const { hide } = planPage(facebook, input('/', modes));
    expect(hide).not.toContain(tab('/groups'));
    expect(hide).not.toContain(tab('/reel'));
    expect(hide).toContain(tab('/marketplace'));
  });

  describe('the home page', () => {
    // Cut down to its structure on the live site on 2026-10-03.
    const page = `
      <div role="banner">
        <label><input type="search" aria-label="Search Facebook"></label>
        <div role="navigation"><ul>
          <li><a href="/">Home</a></li>
          <li><a href="/groups/">Groups tab</a></li>
        </ul></div>
      </div>
      <div>
        <div role="navigation"><div>
          <ul>
            <li><a href="https://www.facebook.com/friends/">Friends</a></li>
            <li><a href="https://www.facebook.com/groups/?ref=bookmarks">Groups</a></li>
            <li><a href="https://www.facebook.com/reel/?s=tab">Reels</a></li>
            <li><a href="https://www.facebook.com/marketplace/?ref=bookmark">Marketplace</a></li>
            <li><a href="https://www.facebook.com/gaming/play/">Play games</a></li>
          </ul>
          <div>
            <div><span><h3>Your shortcuts</h3></span></div>
            <ul><li><a href="https://www.facebook.com/groups/123/">A group</a></li></ul>
          </div>
        </div></div>
        <div role="main"></div>
        <div role="complementary"><div>
          <div>
            <div><h3>Sponsored</h3></div>
            <div><a attributionsrc href="https://l.facebook.com/l.php?u=x">An ad</a></div>
          </div>
          <div data-visualcompletion="ignore-dynamic">
            <div><h3>Contacts</h3></div>
            <ul><li><a href="/messages/t/1/">A friend</a></li></ul>
          </div>
          <div data-visualcompletion="ignore-dynamic">
            <div><h3>Group chats</h3></div>
            <ul><li><div role="button">A group chat</div></li></ul>
          </div>
        </div></div>
      </div>`;

    /** What's left showing on the home page with the given modes. */
    function visible(modes: Partial<Record<SurfaceId, Mode>> = {}): string[] {
      document.body.innerHTML = page;
      const { hide } = planPage(facebook, input('/', modes));
      return [...document.querySelectorAll('a, h3, input, [role="button"]')]
        .filter((element) => !hide.some((selector) => element.closest(selector)))
        .map((element) => element.getAttribute('aria-label') ?? element.textContent);
    }

    it('is cut down to Home by default', () => {
      expect(visible()).toEqual(['Home']);
    });

    it('keeps the search bar when it is off', () => {
      expect(visible({ 'facebook.search': 'off' })).toEqual(['Search Facebook', 'Home']);
    });

    it('keeps the sidebar, without the removed links, when it is off', () => {
      // Shortcuts to single groups stay, though the Groups link goes.
      expect(visible({ 'facebook.sidebar': 'off' })).toEqual([
        'Home',
        'Friends',
        'Your shortcuts',
        'A group',
      ]);
    });

    it('removes the ads and the chat lists separately', () => {
      expect(visible({ 'facebook.sponsored': 'off' })).toEqual(['Home', 'Sponsored', 'An ad']);
      expect(visible({ 'facebook.contacts': 'off' })).toEqual([
        'Home',
        'Contacts',
        'A friend',
        'Group chats',
        'A group chat',
      ]);
    });
  });

  it('removes the stories row on the home page', () => {
    const tray = '[role="main"] [role="region"]:has(a[href*="/stories/"])';
    expect(planPage(facebook, input('/')).hide).toContain(tray);
    const friction = input('/', { 'facebook.stories': 'friction' });
    expect(planPage(facebook, friction).hide).not.toContain(tray);
  });

  it('puts the stories viewer behind the prompt, but not making a story', () => {
    for (const mode of ['remove', 'friction'] as const) {
      for (const path of ['/stories/123/abc=/', '/stories/123/abc=/?view_single=true']) {
        const plan = planPage(facebook, input(path, { 'facebook.stories': mode }));
        expect(plan.gated, `${mode} ${path}`).toBe('facebook.stories');
      }
    }
    expect(planPage(facebook, input('/stories/create/')).gated).toBeNull();
    const off = input('/stories/123/abc=/', { 'facebook.stories': 'off' });
    expect(planPage(facebook, off).gated).toBeNull();
  });

  it('puts Reels and the old Video tab behind the prompt', () => {
    for (const mode of ['remove', 'friction'] as const) {
      for (const path of ['/reel/123', '/reel/?s=tab', '/reels/', '/watch/', '/watch?ref=tab']) {
        const plan = planPage(facebook, input(path, { 'facebook.reels': mode }));
        expect(plan.gated, `${mode} ${path}`).toBe('facebook.reels');
      }
    }
  });

  it('lets a specific video through', () => {
    expect(planPage(facebook, input('/watch/?v=123')).gated).toBeNull();
    expect(planPage(facebook, input('/watch/?ref=x&v=123')).gated).toBeNull();
  });
});

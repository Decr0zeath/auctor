import { surface, surfacesOf } from '@/catalog/surfaces';
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
    const off = Object.fromEntries(surfacesOf('youtube').map((id) => [id, 'off' as const]));
    expect(planPage(youtube, input('/shorts/abc', off))).toEqual({
      hide: [],
      css: [],
      rewrite: [],
      pause: [],
      switchOff: [],
      replacements: [],
      gated: null,
      prompt: false,
      passEndsAt: null,
    });
  });

  it('switches autoplay off along with Up next', () => {
    const autoplay = '.ytp-autonav-toggle-button[aria-checked="true"]';
    expect(planPage(youtube, input('/watch?v=abc')).switchOff).toEqual([autoplay]);
    const off = { 'youtube.recommendations': 'off' } as const;
    expect(planPage(youtube, input('/watch?v=abc', off)).switchOff).toEqual([]);
  });

  describe('the optional limits', () => {
    const OPTIONAL = [
      'youtube.search-shelves',
      'youtube.previews',
      'youtube.thumbnails',
      'youtube.counts',
      'youtube.comments',
      'youtube.notifications',
      'youtube.menu',
    ] as const;
    const on = Object.fromEntries(OPTIONAL.map((id) => [id, 'remove' as const]));

    it('are off by default', () => {
      for (const id of OPTIONAL) expect(surface(id).defaultMode, id).toBe('off');
      const plan = planPage(youtube, input('/results?search_query=x'));
      expect(plan).toMatchObject({ css: [], rewrite: [], pause: [] });
      expect(plan.hide).not.toContain('ytd-search ytd-shelf-renderer');
      expect(plan.hide).not.toContain('ytd-watch-flexy #comments');
    });

    it('apply on every page once on, but search shelves only in search', () => {
      for (const path of ['/', '/results?search_query=x', '/watch?v=abc', '/@channel/videos']) {
        const plan = planPage(youtube, input(path, on));
        expect(plan.rewrite, path).toHaveLength(1);
        expect(plan.pause, path).toEqual(['#video-preview video']);
        expect(plan.hide, path).toEqual(
          expect.arrayContaining([
            '#video-preview',
            'ytd-watch-flexy #comments',
            'ytd-masthead ytd-notification-topbar-button-renderer',
            'ytd-app tp-yt-app-drawer#guide',
          ]),
        );
        expect(plan.hide.includes('ytd-search ytd-shelf-renderer'), path).toBe(
          path.startsWith('/results'),
        );
      }
    });

    it('take back the room the menu left', () => {
      const { css } = planPage(youtube, input('/', { 'youtube.menu': 'remove' }));
      expect(css).toEqual(['ytd-app ytd-page-manager { margin-left: 0 !important; }']);
    });
  });

  describe('thumbnails', () => {
    const rule = youtube.surfaces['youtube.thumbnails']!.rewrite![0]!;
    const rewrite = (src: string) => {
      const pattern = new RegExp(rule.from);
      return pattern.test(src) ? src.replace(pattern, rule.to) : src;
    };

    it('become a frame from the middle of the video', () => {
      const frame = 'https://i.ytimg.com/vi/APXDVlNd10M/hq2.jpg';
      for (const src of [
        'https://i.ytimg.com/vi/APXDVlNd10M/hqdefault.jpg?sqp=-oaymwErCOADEI4C&rs=AOn4CLAx',
        'https://i.ytimg.com/vi/APXDVlNd10M/hq720.jpg?sqp=-oaymwEc',
        'https://i.ytimg.com/vi/APXDVlNd10M/hq720_2.jpg',
        'https://i.ytimg.com/vi/APXDVlNd10M/hqdefault_2866.jpg',
        'https://i9.ytimg.com/vi_webp/APXDVlNd10M/maxresdefault.webp',
      ]) {
        expect(rewrite(src), src).toBe(frame);
      }
    });

    it('leave frames, Shorts, live streams, and avatars alone', () => {
      for (const src of [
        'https://i.ytimg.com/vi/APXDVlNd10M/hq2.jpg',
        'https://i.ytimg.com/vi/APXDVlNd10M/oar2.jpg?sqp=x',
        'https://i.ytimg.com/vi/APXDVlNd10M/hqdefault_live.jpg',
        'https://yt3.ggpht.com/ytc/AIdro_lsdcmm=s68-c-k-c0x00ffffff-no-rj',
      ]) {
        expect(rewrite(src), src).toBe(src);
      }
    });
  });

  describe('counts', () => {
    // Cut down to their structure on the live site on 2026-10-03: an artist's card in search
    // with its header and two cards, a search result, and two video pages, one of them live.
    const row = (...parts: string[]) =>
      `<div class="ytContentMetadataViewModelMetadataRow">${parts.join('')}</div>`;
    const text = (value: string, last = false) =>
      `<span role="text" class="${last ? 'ytContentMetadataViewModelMetadataTextLastPart' : ''}">${value}</span>`;
    const dot = '<span class="ytContentMetadataViewModelDelimiter">•</span>';
    const icon = '<span class="ytContentMetadataViewModelLeadingIcon">▷</span>';
    const page = `
      <yt-page-header-view-model><yt-content-metadata-view-model>
        ${row(text('@TaylorSwift', true))}
        ${row(text('63.5M subscribers'), dot, text('666 videos', true))}
      </yt-content-metadata-view-model></yt-page-header-view-model>
      <yt-content-metadata-view-model>
        ${row('<span>Taylor Swift</span>', dot, icon, text('535M'), dot, text('11mo ago', true))}
      </yt-content-metadata-view-model>
      <yt-content-metadata-view-model>
        ${row(text('YouTube'), dot, text('Playlist', true))}
      </yt-content-metadata-view-model>
      <ytd-video-renderer><div id="metadata-line">
        <span class="inline-metadata-item">238K views</span>
        <span class="inline-metadata-item">8 years ago</span>
      </div></ytd-video-renderer>
      <ytd-watch-info-text><yt-formatted-string id="info">
        <span>439M views</span><span>&nbsp;</span><span>21 years ago</span>
      </yt-formatted-string></ytd-watch-info-text>
      <ytd-watch-info-text><yt-formatted-string id="info">
        <span>1,187</span><span>watching now</span><span>Started streaming 16 hours ago</span>
      </yt-formatted-string></ytd-watch-info-text>
      <like-button-view-model><button><div class="ytSpecButtonShapeNextButtonTextContent">19M</div></button></like-button-view-model>
      <ytd-video-owner-renderer>
        <a>jawed</a><yt-formatted-string id="owner-sub-count">6.65M subscribers</yt-formatted-string>
      </ytd-video-owner-renderer>`;

    /** The text left showing with the given modes, as the page's leaves read it. */
    function visible(modes: Partial<Record<SurfaceId, Mode>> = {}): string[] {
      document.body.innerHTML = page;
      const { hide } = planPage(youtube, input('/results?search_query=x', modes));
      return [...document.querySelectorAll('body *')]
        .filter((element) => element.children.length === 0 && element.textContent!.trim())
        .filter((element) => !hide.some((selector) => element.closest(selector)))
        .map((element) => element.textContent!.trim())
        .filter((value) => value !== '•');
    }

    it('are left alone by default', () => {
      expect(visible()).toContain('63.5M subscribers');
      expect(visible()).toContain('19M');
    });

    it('go, leaving the names, dates, and number of videos', () => {
      expect(visible({ 'youtube.counts': 'remove' })).toEqual([
        '@TaylorSwift',
        '666 videos',
        'Taylor Swift',
        '11mo ago',
        'YouTube',
        'Playlist',
        '8 years ago',
        '21 years ago',
        'Started streaming 16 hours ago',
        'jawed',
      ]);
    });
  });

  describe('the menu', () => {
    // Cut down to its structure on the live site on 2026-10-03, signed in: the full menu, then
    // the mini menu that narrower windows show instead.
    const page = `
      <ytd-guide-renderer>
        <ytd-guide-section-renderer><div id="items">
          <ytd-guide-entry-renderer is-primary><a id="endpoint" title="Home" href="/">Home</a></ytd-guide-entry-renderer>
          <ytd-guide-entry-renderer is-primary><a id="endpoint" title="Shorts">Shorts</a></ytd-guide-entry-renderer>
          <ytd-guide-entry-renderer is-primary><a id="endpoint" title="Subscriptions" href="/feed/subscriptions">Subscriptions</a></ytd-guide-entry-renderer>
        </div></ytd-guide-section-renderer>
        <ytd-guide-section-renderer><div id="items">
          <ytd-guide-entry-renderer><a id="endpoint" title="Shorts" href="/@shorts">A channel called Shorts</a></ytd-guide-entry-renderer>
          <ytd-guide-entry-renderer><a id="endpoint" title="History" href="/feed/history">History</a></ytd-guide-entry-renderer>
        </div></ytd-guide-section-renderer>
      </ytd-guide-renderer>
      <ytd-mini-guide-renderer>
        <ytd-mini-guide-entry-renderer><a id="endpoint" title="Home" href="/">Home</a></ytd-mini-guide-entry-renderer>
        <ytd-mini-guide-entry-renderer><a id="endpoint" title="Shorts" href="/shorts/">Shorts</a></ytd-mini-guide-entry-renderer>
        <ytd-mini-guide-entry-renderer><a id="endpoint" title="Subscriptions" href="/feed/subscriptions">Subscriptions</a></ytd-mini-guide-entry-renderer>
      </ytd-mini-guide-renderer>`;

    /** The menu entries left showing on a page with the given modes. */
    function visible(path: string, modes: Partial<Record<SurfaceId, Mode>> = {}, html = page) {
      document.body.innerHTML = html;
      const { hide } = planPage(youtube, input(path, modes));
      return [...document.querySelectorAll('a')]
        .filter((element) => !hide.some((selector) => element.closest(selector)))
        .map((element) => element.textContent);
    }

    it('loses the Shorts tab on every page, in both menus', () => {
      for (const path of ['/', '/watch?v=abc', '/results?search_query=x', '/feed/subscriptions']) {
        expect(visible(path), path).toEqual([
          'Home',
          'Subscriptions',
          'A channel called Shorts',
          'History',
          'Home',
          'Subscriptions',
        ]);
      }
    });

    it('finds the Shorts tab in any language', () => {
      const japanese = page.replace('title="Shorts">Shorts<', 'title="ショート">ショート<');
      expect(visible('/', {}, japanese)).not.toContain('ショート');
    });

    it('keeps the Shorts tab in friction mode', () => {
      const shorts = visible('/', { 'youtube.shorts': 'friction' }).filter((t) => t === 'Shorts');
      expect(shorts).toHaveLength(2);
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
        <div role="main">
          <div><div><div><div role="region" aria-label="Create a post"><div>
            <h3>Create a post</h3>
            <a role="link" aria-label="Your profile" href="/me/"></a>
            <div role="button">What's on your mind?</div>
          </div></div></div></div>
        </div>
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

    it('keeps the post composer when it is off', () => {
      expect(visible({ 'facebook.composer': 'off' })).toEqual([
        'Home',
        'Create a post',
        'Your profile',
        "What's on your mind?",
      ]);
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

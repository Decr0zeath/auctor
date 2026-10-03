/**
 * Runs a site's rules on the current page and keeps them applied as the user navigates,
 * changes settings, a pass runs out, or the next post is up.
 */
import { copy } from '@/catalog/copy';
import { nextPostAt, postFor } from '@/catalog/posts';
import { modeOf, nextDueAt, resolveDue } from '@/catalog/settings';
import type { Settings } from '@/catalog/settings';
import { surface } from '@/catalog/surfaces';
import type { SurfaceId } from '@/catalog/surfaces';
import type { Site } from '@/sites/types';
import { grantPass, passesItem, stateItem } from '@/storage';
import type { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createHider } from './dom';
import { createPauser, createRewriter, createSwitcher } from './effects';
import { createGate } from './gate';
import { planPage, redirectFor } from './plan';
import { createReplacements } from './replacement';

/** The longest delay setTimeout supports. */
const MAX_DELAY = 2 ** 31 - 1;
/** How long "Go back" waits for the browser's back navigation before going somewhere safe. */
const BACK_TIMEOUT = 1500;

export async function runSite(ctx: ContentScriptContext, site: Site): Promise<void> {
  let [state, passes] = await Promise.all([stateItem.getValue(), passesItem.getValue()]);
  if (ctx.isInvalid) return;

  const pagePath = () => location.pathname + location.search;
  const startSettings = resolveDue(state, Date.now()).settings;

  // Shared links are rewritten before the page renders.
  const target = redirectFor(site, {
    path: pagePath(),
    modeOf: (id) => modeOf(startSettings, id),
  });
  if (target) {
    location.replace(target);
    return;
  }

  const hider = createHider();
  const rewriter = createRewriter();
  const pauser = createPauser();
  const switcher = createSwitcher();
  const gate = createGate(ctx);
  const replacements = createReplacements((id) => {
    requested = id;
    evaluate();
  });

  /** A prompt opened from a replacement panel's "Show … anyway" button. */
  let requested: SurfaceId | null = null;
  /** The gated surface had a pass while this page was open, so a new prompt means time ran out. */
  let passedHere = false;
  /** The last page in this tab that wasn't behind the prompt. "Go back" returns there. */
  let lastSafeUrl: string | null = null;
  let retreating = false;
  let leaving = false;
  let timer: number | undefined;

  const fallbackUrl = () => lastSafeUrl ?? new URL(site.exitPath, location.origin).href;

  function evaluate() {
    if (ctx.isInvalid) return;
    const now = Date.now();
    const current = resolveDue(state, now);
    const { settings } = current;
    const plan = planPage(site, {
      path: pagePath(),
      modeOf: (id) => modeOf(settings, id),
      passes,
      now,
    });

    if (plan.gated === null) {
      lastSafeUrl = location.href;
      retreating = false;
      passedHere = false;
    } else if (retreating) {
      // "Go back" landed on another gated page, such as the previous Short.
      location.replace(fallbackUrl());
      return;
    } else if (!plan.prompt) {
      passedHere = true;
    }

    hider.set(plan.hide, plan.css);
    rewriter.set(plan.rewrite);
    pauser.set(plan.pause);
    switcher.set(plan.switchOff);
    replacements.set(plan.replacements, new Date(now));

    if (requested && !plan.replacements.some((item) => item.surface === requested)) {
      requested = null;
    }
    const fromPost = plan.replacements.some(
      (item) => item.surface === requested && item.replacement.post,
    );
    const promptFor = plan.prompt ? plan.gated : requested;
    if (promptFor && !plan.prompt && fromPost) showGiveIn(promptFor, settings, now);
    else if (promptFor) showPrompt(promptFor, settings, plan.prompt && passedHere);
    else gate.close();

    clearTimeout(timer);
    const showsPost = plan.replacements.some((item) => item.replacement.post);
    const next = Math.min(
      plan.passEndsAt ?? Infinity,
      nextDueAt(current) ?? Infinity,
      showsPost ? nextPostAt(new Date(now)) : Infinity,
    );
    if (next !== Infinity) {
      timer = ctx.setTimeout(evaluate, Math.min(Math.max(next - now, 0) + 100, MAX_DELAY));
    }
  }

  function showPrompt(id: SurfaceId, settings: Settings, timeIsUp: boolean) {
    const { name } = surface(id);
    gate.show({
      key: `${id}:${timeIsUp ? 'time-up' : 'opening'}`,
      title: timeIsUp ? copy.passEndedTitle(name) : copy.promptTitle(name),
      message: timeIsUp ? copy.passEndedQuestion : undefined,
      waitSeconds: settings.waitSeconds,
      passMinutes: settings.passMinutes,
      onGoBack: () => goBack(id),
      onContinue: () => void proceed(id, settings.passMinutes),
    });
  }

  /** Giving in from the post: the post's words, with the usual wait. */
  function showGiveIn(id: SurfaceId, settings: Settings, now: number) {
    const { title, message } = postFor(new Date(now)).giveIn;
    gate.show({
      key: `${id}:give-in`,
      title,
      message,
      variant: 'post',
      waitSeconds: settings.waitSeconds,
      passMinutes: settings.passMinutes,
      onGoBack: () => goBack(id),
      onContinue: () => void proceed(id, settings.passMinutes),
    });
  }

  function goBack(id: SurfaceId) {
    if (id === requested) {
      // Asked from a panel on this page: stay here, with the content still removed.
      requested = null;
      evaluate();
      return;
    }
    retreating = true;
    if (lastSafeUrl === null && history.length <= 1) {
      location.replace(fallbackUrl());
      return;
    }
    history.back();
    ctx.setTimeout(() => {
      if (retreating && !leaving) location.replace(fallbackUrl());
    }, BACK_TIMEOUT);
  }

  async function proceed(id: SurfaceId, minutes: number) {
    const until = Date.now() + minutes * 60_000;
    passes = { ...passes, [id]: until };
    requested = null;
    evaluate();
    await grantPass(id, until);
  }

  const unwatchState = stateItem.watch((value) => {
    state = value;
    evaluate();
  });
  const unwatchPasses = passesItem.watch((value) => {
    passes = value;
    evaluate();
  });
  watchLocation(ctx, evaluate);
  ctx.addEventListener(document, 'visibilitychange', evaluate);
  ctx.addEventListener(window, 'beforeunload', () => (leaving = true));
  ctx.onInvalidated(() => {
    unwatchState();
    unwatchPasses();
    hider.remove();
    rewriter.remove();
    pauser.remove();
    switcher.remove();
    replacements.remove();
    gate.close();
  });

  evaluate();
}

/**
 * Calls `onChange` when the URL changes without a page load, as single-page apps like YouTube
 * and Facebook do. Uses the Navigation API where available, with polling as a fallback.
 */
function watchLocation(ctx: ContentScriptContext, onChange: () => void) {
  let last = location.href;
  const check = () => {
    if (location.href === last) return;
    last = location.href;
    onChange();
  };
  const { navigation } = globalThis as unknown as { navigation?: EventTarget };
  navigation?.addEventListener('currententrychange', check, { signal: ctx.signal });
  ctx.addEventListener(window, 'popstate', check);
  ctx.setInterval(check, 250);
}

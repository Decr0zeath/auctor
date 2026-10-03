/**
 * The settings screen, used by both the toolbar popup and the options page. Each site has a tab
 * with one compact row per surface; the pause and backup sit under General.
 */
import { copy } from '@/catalog/copy';
import {
  PASS_MINUTES_OPTIONS,
  WAIT_SECONDS_OPTIONS,
  WEAKEN_DELAY_MS,
  cancelPending,
  changeKey,
  modeOf,
  parseSettingsFile,
  pendingFor,
  requestChange,
  resolveDue,
  toSettingsFile,
  weakens,
} from '@/catalog/settings';
import type { Change, State } from '@/catalog/settings';
import { SITES, surface, surfacesOf } from '@/catalog/surfaces';
import type { SiteId, SurfaceId } from '@/catalog/surfaces';
import { h } from '@/engine/dom';
import { stateItem, updateState } from '@/storage';
import { browser } from 'wxt/browser';

const DELAY_HOURS = WEAKEN_DELAY_MS / 3_600_000;

type Tab = SiteId | 'general';
const TABS: Tab[] = [...(Object.keys(SITES) as SiteId[]), 'general'];
const TAB_KEY = 'auctor:tab';

const tabName = (tab: Tab): string => (tab === 'general' ? 'General' : SITES[tab].name);

/** The settings each tab holds, as change keys. */
const keysOf = (tab: Tab): string[] =>
  tab === 'general' ? ['waitSeconds', 'passMinutes'] : surfacesOf(tab).map((id) => `mode:${id}`);

const when = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

/** Reopening the popup returns to the last tab. Storage can be blocked, so it's only a nicety. */
function savedTab(): Tab {
  try {
    const tab = localStorage.getItem(TAB_KEY) as Tab | null;
    if (tab && TABS.includes(tab)) return tab;
  } catch {
    // Fall through to the first tab.
  }
  return TABS[0]!;
}

function saveTab(tab: Tab) {
  try {
    localStorage.setItem(TAB_KEY, tab);
  } catch {
    // Not worth surfacing.
  }
}

export async function mountSettings(root: HTMLElement, { full }: { full: boolean }) {
  let state: State = await updateState((current) => current);
  let tab = savedTab();
  let notice = '';

  const change = (next: Change) => updateState((current, now) => requestChange(current, next, now));
  const cancel = (key: string) => updateState((current) => cancelPending(current, key));

  stateItem.watch((value) => {
    state = resolveDue(value, Date.now());
    render();
  });

  function render() {
    // Re-rendering replaces every element, so carry keyboard focus across.
    const focused = (document.activeElement as HTMLElement | null)?.dataset.focus;
    root.replaceChildren(
      h(
        'header',
        {},
        h('h1', {}, 'Auctor'),
        h('p', { class: 'tagline' }, 'Be the author of your attention.'),
      ),
      tabList(),
      h(
        'div',
        { class: 'panel', role: 'tabpanel', id: 'panel', 'aria-labelledby': `tab-${tab}` },
        ...(tab === 'general' ? generalPanel() : surfacesOf(tab).map(surfaceRow)),
      ),
      h(
        'p',
        { class: 'rule' },
        `Loosening protection waits ${DELAY_HOURS} hours. Tightening is instant.`,
      ),
    );
    if (focused) root.querySelector<HTMLElement>(`[data-focus="${focused}"]`)?.focus();
  }

  function select(next: Tab, focus: boolean) {
    tab = next;
    saveTab(next);
    render();
    if (focus) root.querySelector<HTMLElement>(`[data-focus="tab:${next}"]`)?.focus();
  }

  function tabList() {
    const tabs = TABS.map((id) => {
      const selected = id === tab;
      const waiting = state.pending.some((p) => keysOf(id).includes(changeKey(p.change)));
      const button = h(
        'button',
        {
          type: 'button',
          role: 'tab',
          id: `tab-${id}`,
          'aria-selected': String(selected),
          'aria-controls': 'panel',
          tabindex: selected ? '0' : '-1',
          'data-focus': `tab:${id}`,
        },
        tabName(id),
        waiting &&
          h(
            'span',
            { class: 'dot', title: 'A change is waiting' },
            h('span', { class: 'sr-only' }, ' (change waiting)'),
          ),
      );
      button.addEventListener('click', () => select(id, false));
      return button;
    });
    const list = h('div', { class: 'tabs', role: 'tablist', 'aria-label': 'Settings' }, ...tabs);
    list.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
      if (!step) return;
      event.preventDefault();
      select(TABS[(TABS.indexOf(tab) + step + TABS.length) % TABS.length]!, true);
    });
    return list;
  }

  function surfaceRow(id: SurfaceId) {
    const { label, description, modes } = surface(id);
    const current = modeOf(state.settings, id);
    const pending = pendingFor(state, `mode:${id}`);
    const queued = pending?.change.setting === 'mode' ? pending.change.value : undefined;
    const modeButtons = modes.map((mode) => {
      const button = h(
        'button',
        {
          type: 'button',
          title: copy.modes[mode].hint,
          class: mode === queued ? 'queued' : undefined,
          'data-mode': mode,
          'aria-pressed': String(mode === current),
          'data-focus': `${id}:${mode}`,
        },
        copy.modes[mode].label,
      );
      button.addEventListener('click', () => change({ setting: 'mode', surface: id, value: mode }));
      return button;
    });
    return h(
      'div',
      { class: 'row' },
      // The description is a tooltip here, and read out with the buttons for screen readers.
      h('span', { class: 'name', title: description }, label),
      h('span', { class: 'sr-only', id: `about-${id}` }, description),
      h(
        'div',
        {
          class: 'modes',
          role: 'group',
          'aria-label': label,
          'aria-describedby': `about-${id}`,
        },
        ...modeButtons,
      ),
      pending &&
        queued &&
        pendingLine(
          `Turns ${copy.modes[queued].label} on ${when.format(pending.effectiveAt)}.`,
          `mode:${id}`,
        ),
    );
  }

  function generalPanel() {
    return [
      h('h2', {}, 'The pause'),
      selectRow({
        label: 'Wait before Continue',
        key: 'waitSeconds',
        value: state.settings.waitSeconds,
        options: WAIT_SECONDS_OPTIONS,
        format: (seconds) => `${seconds} seconds`,
        onChange: (value) => change({ setting: 'waitSeconds', value }),
      }),
      selectRow({
        label: 'Time allowed after Continue',
        key: 'passMinutes',
        value: state.settings.passMinutes,
        options: PASS_MINUTES_OPTIONS,
        format: (minutes) => `${minutes} min`,
        onChange: (value) => change({ setting: 'passMinutes', value }),
      }),
      h('h2', {}, 'Backup'),
      full ? backupSection() : backupLink(),
    ];
  }

  function selectRow(options: {
    label: string;
    key: 'waitSeconds' | 'passMinutes';
    value: number;
    options: readonly number[];
    format: (value: number) => string;
    onChange: (value: number) => void;
  }) {
    const select = h(
      'select',
      { id: options.key, 'data-focus': options.key },
      ...options.options.map((value) =>
        h(
          'option',
          { value: String(value), selected: value === options.value },
          options.format(value),
        ),
      ),
    );
    select.addEventListener('change', () => options.onChange(Number(select.value)));
    const pending = pendingFor(state, options.key);
    return h(
      'div',
      { class: 'row' },
      h('label', { class: 'name', for: options.key }, options.label),
      select,
      pending &&
        pendingLine(
          `Changes to ${options.format(pending.change.value as number)} on ${when.format(pending.effectiveAt)}.`,
          options.key,
        ),
    );
  }

  function pendingLine(text: string, key: string) {
    const button = h('button', { type: 'button', 'data-focus': `cancel:${key}` }, 'Cancel');
    button.addEventListener('click', () => cancel(key));
    return h('p', { class: 'pending' }, text, ' ', button);
  }

  function backupSection() {
    const exportButton = h('button', { type: 'button' }, 'Export settings');
    exportButton.addEventListener('click', () => {
      const file = JSON.stringify(toSettingsFile(state.settings), null, 2);
      const url = URL.createObjectURL(new Blob([file], { type: 'application/json' }));
      h('a', { href: url, download: 'auctor-settings.json' }).click();
      URL.revokeObjectURL(url);
    });

    const input = h('input', { type: 'file', accept: '.json,application/json', hidden: true });
    const importButton = h('button', { type: 'button' }, 'Import settings');
    importButton.addEventListener('click', () => input.click());
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (file) notice = await importFile(file);
      render();
    });

    return h(
      'div',
      { class: 'backup' },
      h(
        'p',
        { class: 'hint' },
        'Copy your settings to another browser. Imported changes follow the same rules as any other change.',
      ),
      h('div', { class: 'buttons' }, exportButton, importButton, input),
      notice && h('p', { class: 'notice', role: 'status' }, notice),
    );
  }

  function backupLink() {
    const link = h('button', { type: 'button', class: 'link' }, 'Export or import settings');
    link.addEventListener('click', () => browser.runtime.openOptionsPage());
    return h('p', { class: 'backup' }, link);
  }

  render();
}

async function importFile(file: File): Promise<string> {
  let parsed: ReturnType<typeof parseSettingsFile>;
  try {
    parsed = parseSettingsFile(JSON.parse(await file.text()));
  } catch {
    return 'That file is not valid JSON.';
  }
  if ('error' in parsed) return parsed.error;

  let delayed = 0;
  await updateState((current, now) =>
    parsed.changes.reduce((next, item) => {
      if (weakens(next.settings, item)) delayed += 1;
      return requestChange(next, item, now);
    }, current),
  );
  return delayed === 0
    ? 'Settings imported.'
    : `Settings imported. ${delayed} ${delayed === 1 ? 'change loosens' : 'changes loosen'} protection, so ${delayed === 1 ? 'it takes' : 'they take'} effect in ${DELAY_HOURS} hours.`;
}

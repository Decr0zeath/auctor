/**
 * The settings screen, used by both the toolbar popup and the options page.
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

const when = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  hour: 'numeric',
  minute: '2-digit',
});

export async function mountSettings(root: HTMLElement, { full }: { full: boolean }) {
  let state: State = await updateState((current) => current);
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
      h(
        'p',
        { class: 'rule' },
        `Changes that loosen protection take effect after ${DELAY_HOURS} hours. Tightening takes effect right away.`,
      ),
      ...(Object.keys(SITES) as SiteId[]).map(siteSection),
      pauseSection(),
      full ? backupSection() : footer(),
    );
    if (focused) root.querySelector<HTMLElement>(`[data-focus="${focused}"]`)?.focus();
  }

  function siteSection(site: SiteId) {
    return h(
      'section',
      {},
      h('h2', {}, SITES[site].name),
      ...surfacesOf(site).map((id) => surfaceRow(id)),
    );
  }

  function surfaceRow(id: SurfaceId) {
    const { label, description, modes } = surface(id);
    const current = modeOf(state.settings, id);
    const modeButtons = modes.map((mode) => {
      const button = h(
        'button',
        {
          type: 'button',
          title: copy.modes[mode].hint,
          'aria-pressed': String(mode === current),
          'data-focus': `${id}:${mode}`,
        },
        copy.modes[mode].label,
      );
      button.addEventListener('click', () => change({ setting: 'mode', surface: id, value: mode }));
      return button;
    });
    const pending = pendingFor(state, `mode:${id}`);
    return h(
      'div',
      { class: 'row' },
      h('div', { class: 'label' }, h('strong', {}, label), h('span', {}, description)),
      h('div', { class: 'modes', role: 'group', 'aria-label': label }, ...modeButtons),
      pending?.change.setting === 'mode' &&
        pendingLine(
          `Turns ${copy.modes[pending.change.value].label} on ${when.format(pending.effectiveAt)}.`,
          changeKey(pending.change),
        ),
    );
  }

  function pauseSection() {
    return h(
      'section',
      {},
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
    );
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
      { 'data-focus': options.key },
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
      h('label', { class: 'label' }, h('strong', {}, options.label), select),
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
      'section',
      {},
      h('h2', {}, 'Backup'),
      h(
        'p',
        { class: 'hint' },
        'Copy your settings to another browser. Imported changes follow the same rules as any other change.',
      ),
      h('div', { class: 'buttons' }, exportButton, importButton, input),
      notice && h('p', { class: 'notice', role: 'status' }, notice),
    );
  }

  function footer() {
    const link = h('button', { type: 'button', class: 'link' }, 'Backup and import');
    link.addEventListener('click', () => browser.runtime.openOptionsPage());
    return h('footer', {}, link);
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

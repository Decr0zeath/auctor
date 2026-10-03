/**
 * User-facing wording that every platform should keep the same. Platform-specific UI text
 * (settings screens, buttons that only exist in the browser) stays with that platform.
 */
import type { Mode } from './surfaces';

export const copy = {
  promptTitle: (name: string) => `Why are you opening ${name}?`,
  passEndedTitle: (name: string) => `Your time with ${name} is up.`,
  passEndedQuestion: 'Do you still want to keep going?',
  goBack: 'Go back',
  /** Seconds under a minute, minutes and seconds from there: "Continue in 15…", "Continue in 2:00…". */
  continueIn: (seconds: number) =>
    `Continue in ${seconds < 60 ? seconds : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}…`,
  continueFor: (minutes: number) => `Continue for ${minutes} min`,
  promptFooter: 'A pause you set for yourself with Auctor.',
  removedTitle: (name: string) => `Auctor removed ${name}.`,
  modes: {
    remove: { label: 'Remove', hint: 'Hidden. You can still open it after a pause.' },
    friction: { label: 'Ask first', hint: 'A pause and a question before it opens.' },
    off: { label: 'Off', hint: 'Left as it is.' },
  } satisfies Record<Mode, { label: string; hint: string }>,
};

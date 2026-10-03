import { describe, expect, it } from 'vitest';
import { copy } from './copy';

describe('the prompt countdown', () => {
  it('counts seconds under a minute, then minutes and seconds', () => {
    expect(copy.continueIn(15)).toBe('Continue in 15…');
    expect(copy.continueIn(59)).toBe('Continue in 59…');
    expect(copy.continueIn(120)).toBe('Continue in 2:00…');
    expect(copy.continueIn(65)).toBe('Continue in 1:05…');
  });
});

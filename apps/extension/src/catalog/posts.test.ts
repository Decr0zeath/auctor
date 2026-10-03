import { describe, expect, it } from 'vitest';
import { GIVE_IN, GIVE_IN_WAIT_SECONDS, PAINTINGS, QUOTES, dayNumber, postFor } from './posts';

describe('the daily post', () => {
  it('stays the same all day, by the local calendar', () => {
    const morning = postFor(new Date(2026, 9, 3, 0, 0, 1));
    const night = postFor(new Date(2026, 9, 3, 23, 59, 59));
    expect(night).toEqual(morning);
  });

  it('changes at midnight', () => {
    const today = postFor(new Date(2026, 9, 3, 23, 59, 59));
    const tomorrow = postFor(new Date(2026, 9, 4, 0, 0, 1));
    expect(tomorrow.quote).not.toBe(today.quote);
    expect(tomorrow.painting).not.toBe(today.painting);
    expect(tomorrow.giveIn).not.toBe(today.giveIn);
  });

  it('counts days across daylight saving changes', () => {
    // Most of Europe moves its clocks back on this night.
    expect(dayNumber(new Date(2026, 9, 26)) - dayNumber(new Date(2026, 9, 25))).toBe(1);
  });

  it('shows every quote once before repeating one', () => {
    const start = new Date(2026, 0, 1);
    const days = Array.from({ length: QUOTES.length }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return postFor(date).quote;
    });
    expect(new Set(days).size).toBe(QUOTES.length);
  });

  it('pairs every quote with every painting over time', () => {
    const pairs = new Set<string>();
    const start = new Date(2026, 0, 1);
    for (let i = 0; i < QUOTES.length * PAINTINGS.length; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const { quote, painting } = postFor(date);
      pairs.add(`${QUOTES.indexOf(quote)}:${painting.id}`);
    }
    expect(pairs.size).toBe(QUOTES.length * PAINTINGS.length);
  });

  it('has no duplicate quotes, paintings, or ways back', () => {
    expect(new Set(QUOTES.map((quote) => quote.text)).size).toBe(QUOTES.length);
    expect(new Set(PAINTINGS.map((painting) => painting.id)).size).toBe(PAINTINGS.length);
    for (const key of ['label', 'title', 'message'] as const) {
      expect(new Set(GIVE_IN.map((giveIn) => giveIn[key])).size, key).toBe(GIVE_IN.length);
    }
  });

  it('words the way back as a statement that leaves the choice with you', () => {
    for (const { title, message } of GIVE_IN) {
      expect(title, title).toMatch(/\.$/);
      // No orders: controlling words make people push back.
      expect(`${title} ${message}`, title).not.toMatch(/\b(must|should|have to|need to)\b/i);
      // Each message ends on the choice, said outright or left with you.
      expect(message, title).toMatch(
        /(yours|your call|up to you|You decide|free to choose|will be here)\.$/,
      );
    }
  });

  it('makes giving in from the post wait two minutes', () => {
    expect(GIVE_IN_WAIT_SECONDS).toBe(120);
  });

  it('keeps quotes short enough to fit over a painting', () => {
    for (const { text } of QUOTES) expect(text.length, text).toBeLessThanOrEqual(160);
  });
});

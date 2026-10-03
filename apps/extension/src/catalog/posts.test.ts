import { describe, expect, it } from 'vitest';
import { GIVE_IN, PAINTINGS, POST_MINUTES, QUOTES, nextPostAt, postFor, postNumber } from './posts';

/** The posts for `turns` turns in a row, from `start`. */
const postsFrom = (start: Date, turns: number) =>
  Array.from({ length: turns }, (_, i) =>
    postFor(new Date(start.getTime() + i * POST_MINUTES * 60_000)),
  );

// Long enough for the paintings to skip one at every offset against the quotes.
const MANY_TURNS = 2 * QUOTES.length * PAINTINGS.length;

describe('the post', () => {
  it('changes every ten minutes, on the clock', () => {
    expect(POST_MINUTES).toBe(10);
    const first = postFor(new Date(Date.UTC(2026, 9, 3, 14, 10, 0)));
    expect(postFor(new Date(Date.UTC(2026, 9, 3, 14, 19, 59)))).toEqual(first);
    expect(postFor(new Date(Date.UTC(2026, 9, 3, 14, 20, 0)))).not.toEqual(first);
  });

  it('knows when the next post is up', () => {
    const now = new Date(Date.UTC(2026, 9, 3, 14, 12, 30));
    expect(nextPostAt(now)).toBe(Date.UTC(2026, 9, 3, 14, 20));
    expect(postNumber(new Date(nextPostAt(now)))).toBe(postNumber(now) + 1);
  });

  it('never keeps the last post’s quote, painting, or way back', () => {
    const posts = postsFrom(new Date(2026, 9, 3), MANY_TURNS);
    for (let i = 1; i < posts.length; i++) {
      const [last, next] = [posts[i - 1]!, posts[i]!];
      expect(next.quote, `turn ${i}`).not.toBe(last.quote);
      expect(next.painting, `turn ${i}`).not.toBe(last.painting);
      expect(next.giveIn, `turn ${i}`).not.toBe(last.giveIn);
    }
  });

  it('shows every quote, and every painting but one, before repeating any', () => {
    const posts = postsFrom(new Date(2026, 9, 3), MANY_TURNS);
    const distinct = (length: number, key: 'quote' | 'painting') => {
      for (let i = 0; i + length <= posts.length; i++) {
        const shown = posts.slice(i, i + length).map((post) => post[key]);
        expect(new Set(shown).size, `${key}s from turn ${i}`).toBe(length);
      }
    };
    distinct(QUOTES.length, 'quote');
    distinct(PAINTINGS.length - 1, 'painting');
  });

  it('pairs every quote with every painting over time', () => {
    const pairs = new Set(
      postsFrom(new Date(0), QUOTES.length * PAINTINGS.length).map(
        ({ quote, painting }) => `${QUOTES.indexOf(quote)}:${painting.id}`,
      ),
    );
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

  it('keeps quotes short enough to fit over a painting', () => {
    for (const { text } of QUOTES) expect(text.length, text).toBeLessThanOrEqual(160);
  });
});

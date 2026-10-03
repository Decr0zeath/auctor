import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { SURFACES, SURFACE_IDS } from './surfaces';

const docs = readFileSync(resolve(import.meta.dirname, '../../../../docs/surfaces.md'), 'utf8');

describe('docs/surfaces.md', () => {
  it('lists every surface with its default and modes', () => {
    for (const id of SURFACE_IDS) {
      const { defaultMode, modes } = SURFACES[id];
      const row = `| \`${id}\` | \`${defaultMode}\` | ${modes.map((mode) => `\`${mode}\``).join(', ')} |`;
      expect(docs, id).toContain(row);
    }
  });
});

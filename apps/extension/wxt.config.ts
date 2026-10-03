import { defineConfig } from 'wxt';
import { SITE_RULES } from './src/sites';
import { surfaceRules } from './src/sites/types';

// Sites that show the post load its paintings and fonts from the extension.
const postMatches = SITE_RULES.filter((site) =>
  surfaceRules(site).some(([, rules]) => rules.replacement?.post),
).flatMap((site) => site.matches);

export default defineConfig({
  srcDir: 'src',
  // Explicit imports keep every module readable on its own and easy to lint.
  imports: false,
  manifest: ({ browser }) => ({
    name: 'Auctor — Remove Feeds, Shorts & Reels',
    short_name: 'Auctor',
    description:
      'Be the author of your attention. Removes the feeds you land on and adds a pause before the ones you choose to enter.',
    // Content scripts declare their own site matches, so storage is the only permission needed.
    permissions: ['storage'],
    web_accessible_resources: [{ resources: ['posts/*', 'fonts/*'], matches: postMatches }],
    action: { default_title: 'Auctor' },
    ...(browser === 'firefox' && {
      browser_specific_settings: {
        gecko: {
          id: 'auctor@decr0zeath.github.io',
          data_collection_permissions: { required: ['none'] },
        },
      },
    }),
  }),
});

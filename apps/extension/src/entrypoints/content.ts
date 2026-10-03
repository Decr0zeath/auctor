import { runSite } from '@/engine/run';
import { ALL_MATCHES, siteForUrl } from '@/sites';
import { defineContentScript } from 'wxt/utils/define-content-script';

export default defineContentScript({
  matches: ALL_MATCHES,
  // Early enough to rewrite shared links and hide feeds before they render.
  runAt: 'document_start',
  async main(ctx) {
    const site = siteForUrl(location.href);
    if (site) await runSite(ctx, site);
  },
});

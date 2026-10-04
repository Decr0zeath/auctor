# Chrome Web Store listing

What to enter in each field of the [developer dashboard](https://chrome.google.com/webstore/devconsole). The name and summary come from the manifest, so they're set in `wxt.config.ts`.

## Package

Run `pnpm zip` and upload `.output/auctorextension-<version>-chrome.zip`. Every upload needs a higher `version` in `package.json`.

## Store listing

| Field | Value |
| --- | --- |
| Category | Lifestyle › Well-being |
| Language | English |
| Store icon | `public/icon-128.png` |
| Screenshots | `store/screenshots/`, in order (1280×800) |
| Small promo tile | `store/promo-small.png` (440×280) |
| Homepage URL | `https://github.com/Decr0zeath/auctor` |
| Support URL | `https://github.com/Decr0zeath/auctor/issues` |

Description:

```text
Be the author of your attention.

Auctor removes the feeds you land on without choosing, and adds a pause before the ones you choose to enter. Search, subscriptions, messages, groups, and the videos you came for keep working.

ON FACEBOOK
• The feed becomes one post: a painting of a warrior, emperor, or hero with a quote from the Stoics or the Bible. It changes every 10 minutes and never sooner, so refreshing brings nothing new.
• Under it, the only thing to click is a way back to the feed, and that goes through the pause.
• Reels, Marketplace, Groups, Gaming, and the search bar leave the top bar. Stories, the post composer, the sidebar, ads, and contacts leave the home page. Each is its own setting, and the pages still open from links and notifications.
• The Reels and Stories viewers ask before they open.

ON YOUTUBE
• Shorts leave the menu and the shelves in home, search, and subscriptions. A shared Short opens as a normal video. The Shorts player asks before it opens.
• Up next and end screens are hidden, and autoplay is off.
• The home feed stays by default, for picking background listening. Removing it is one click.
• Optional, off by default: hide search shelves, hover previews, view and subscriber counts, comments, the notifications bell, or the side menu, and swap thumbnails for a frame from the video.

THE PAUSE
Opening a feed you chose to enter asks why you're opening it. Go back is the main button. Continue unlocks after 2 minutes and gives you 5. The wait can be set from 2 to 10 minutes, and the time you get from 1 to 30.

LOOSENING WAITS A DAY
Tightening a setting is instant. Loosening one takes effect after 24 hours, so your calm self makes the choice, not the one reaching for the feed. A study of 8,000 users of a similar tool found they drifted to easier settings while expecting to toughen up later.

PRIVATE BY DESIGN
• Nothing leaves your browser. No accounts, servers, analytics, or ads.
• The only permission is storage, for your settings. It runs on YouTube and Facebook and nowhere else.
• Open source under GPL-3.0: github.com/Decr0zeath/auctor
```

## Privacy practices

Single purpose:

```text
Auctor reduces compulsive scrolling on YouTube and Facebook: it removes the feeds a user lands on without choosing, and adds a pause before the feeds they choose to enter.
```

Permission justifications:

| Permission | Justification |
| --- | --- |
| `storage` | `Saves the user's settings (what each feed is set to, and how long the pause and the pass last), changes waiting out the 24-hour delay, and when a pass ends. Stored locally and never transmitted.` |
| Host permissions | `The content script hides feeds and shows the pause on www.youtube.com and www.facebook.com, the only sites the extension changes. web.facebook.com is Facebook's default address in some regions.` |

Remote code: **No, I am not using remote code.** Everything ships in the package.

Data usage: tick **Website content** only, and the three certifications. The extension reads and changes the page's content, and the [user data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) asks for handling to be disclosed even when it stays on the device. It reads no personal data, history, or activity.

Privacy policy URL: `https://github.com/Decr0zeath/auctor/blob/main/PRIVACY.md`

## Distribution

Visibility: **Unlisted** until it's ready to show in search, then **Public**.

Test instructions for reviewers:

```text
No account or setup is needed. On youtube.com, open any Short to see the pause, or a video to see Up next removed. On facebook.com, signed in with any account, the feed is replaced by one post. Settings are in the toolbar popup.
```

# Surfaces

The contract both apps follow. A **surface** is one brain-rot entry point inside a site or app. The browser extension and the Android app detect surfaces differently, but a surface's ID, modes, and behavior are the same everywhere.

The source of truth is [`apps/extension/src/catalog/`](../apps/extension/src/catalog/). A unit test checks that the table below lists every surface with its default.

## Modes

From strongest to weakest:

| Mode | What happens |
|---|---|
| `remove` | Hidden. Where the content was, a panel offers search and shortcuts, or the [daily post](#the-daily-post), plus a "show anyway" option that goes through the prompt. Entering the surface on purpose (such as the Shorts tab) still works through the prompt. |
| `friction` | Shown, but entering it opens the prompt first. |
| `off` | Left as it is. |

## Catalogue

Surface IDs are `<site>.<surface>` and are permanent once released, because settings files store them.

| Surface ID | Default | Modes | Covers |
|---|---|---|---|
| `youtube.home-feed` | `off` | `remove`, `off` | The recommendation grid on the home page. Off by default, because the home feed is where many people pick background listening. |
| `youtube.shorts` | `remove` | `remove`, `friction`, `off` | Shorts shelves, and the Shorts player. A shared Short opens as a normal video, unless the mode is `off`. |
| `youtube.recommendations` | `remove` | `remove`, `off` | The "Up next" sidebar and end screens on video pages |
| `facebook.feed` | `remove` | `remove`, `off` | The feed on the home page, which becomes the [daily post](#the-daily-post). The Feeds page (All, Favorites, Friends, Groups, Pages), which only shows sources you follow, stays. |
| `facebook.composer` | `remove` | `remove`, `off` | The "What's on your mind?" box on the home page. Posting still works from your profile. |
| `facebook.stories` | `remove` | `remove`, `friction`, `off` | The stories row (called My Day in some regions) on the home page, and the stories viewer. Making your own story (`/stories/create/`) opens normally. |
| `facebook.reels` | `remove` | `remove`, `friction`, `off` | Reels in the top bar and the home page's left sidebar (Video in older layouts), and the Reels player, including the old Video page (`/watch`), which now redirects to Reels. A link to a specific video opens normally. |
| `facebook.marketplace` | `remove` | `remove`, `off` | Marketplace in the top bar and the home page's left sidebar. Marketplace itself still opens from search and links. |
| `facebook.groups` | `remove` | `remove`, `off` | Groups in the top bar and the home page's left sidebar. Groups themselves still open from search and links, and shortcuts to single groups stay. |
| `facebook.gaming` | `remove` | `remove`, `off` | Gaming in the top bar, and Gaming Video and Play games in the home page's left sidebar |
| `facebook.search` | `remove` | `remove`, `off` | The search bar in the top bar |
| `facebook.sidebar` | `remove` | `remove`, `off` | The home page's left sidebar: the menu and your shortcuts. The sidebar keeps its width, so the main column stays centered. |
| `facebook.sponsored` | `remove` | `remove`, `off` | The ads in the home page's right panel |
| `facebook.contacts` | `remove` | `remove`, `off` | The Contacts and Group chats lists in the home page's right panel. Chats still open from Messenger. |

## The daily post

Where a removed feed was, there's **one post a day**: a painting with a quote over it. Under it, the only thing to click is the way back to the feed, worded to make you think twice ("Succumb to temptation", "Abandon the vigil", "Kneel to the algorithm"). It still goes through the prompt, and its tooltip says what it does.

- The post, its way back, and the prompt it opens change at **local midnight** and stay the same all day. Refreshing never brings a new one, because a post that changed on every visit would be a feed of its own.
- Quotes and paintings each go round in order, and the paintings shift one step each time the quotes start over, so in time every quote meets every painting. The same date gives the same post on every device.
- Quotes come from the Stoics (Seneca, Marcus Aurelius, Epictetus) and the Bible (King James Version), about time, discipline, and putting things off. Each one is checked word for word against a public-domain translation.
- Paintings are in the public domain, cropped to 4:5 at 960×1200, and ship with the app, so showing the post makes no network requests.
- The list is in [`apps/extension/src/catalog/posts.ts`](../apps/extension/src/catalog/posts.ts), with each quote's translation and each painting's source.
- Shown on `facebook.feed`. YouTube's home feed gets it later.

## The prompt

- Title: **"Why are you opening {name}?"** For example, "Why are you opening YouTube Shorts?"
- **Go back** is the main action and has focus. It returns to the last page outside the surface, or to a safe page if there isn't one.
- **Continue** unlocks after the wait (default 15 seconds, counted only while the page is visible). It opens the surface for a pass (default 5 minutes).
- When a pass runs out while the surface is open, the prompt returns: **"Your time with {name} is up."**
- Giving in from the [daily post](#the-daily-post) opens a different prompt, which says rather than asks. Its title is a statement (**"You are meant for more, not for this."**), with a short message under it. Both change with the post, once a day. Its wait is a flat **2 minutes**, whatever the setting, and the pass is the usual one.
- While the prompt is open, the page behind it can't be scrolled, typed into, or played.

## Delayed changes

A change that **weakens** protection takes effect **24 hours** after it's requested. A change that **tightens** protection takes effect immediately and cancels any pending change to the same setting.

| Setting | Weakening means |
|---|---|
| A surface's mode | A weaker mode (`remove` → `friction` → `off`) |
| `waitSeconds` | A shorter wait |
| `passMinutes` | A longer pass |

Requesting the same pending change again keeps its original schedule. Requesting a different weakening restarts the 24 hours. Importing a settings file follows the same rules.

## Settings file

Export and import move settings between devices without a sync server.

```json
{
  "format": "auctor-settings",
  "version": 1,
  "settings": {
    "surfaces": { "youtube.shorts": "friction", "facebook.feed": "remove" },
    "waitSeconds": 15,
    "passMinutes": 5
  }
}
```

- Surfaces missing from `surfaces` use their default.
- Unknown surface IDs are kept, so a file from a platform with more surfaces round-trips without loss.
- `waitSeconds` is one of 3, 5, 10, 15, or 30. `passMinutes` is one of 1, 3, 5, 10, 15, or 30. Invalid values are skipped on import.

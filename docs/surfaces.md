# Surfaces

The contract both apps follow. A **surface** is one brain-rot entry point inside a site or app. The browser extension and the Android app detect surfaces differently, but a surface's ID, modes, and behavior are the same everywhere.

The source of truth is [`apps/extension/src/catalog/`](../apps/extension/src/catalog/). A unit test checks that the table below lists every surface with its default.

## Modes

From strongest to weakest:

| Mode | What happens |
|---|---|
| `remove` | Hidden. Where the content was, a panel offers search and shortcuts, plus a "show anyway" option that goes through the prompt. Entering the surface on purpose (such as the Shorts tab) still works through the prompt. |
| `friction` | Shown, but entering it opens the prompt first. |
| `off` | Left as it is. |

## Catalogue

Surface IDs are `<site>.<surface>` and are permanent once released, because settings files store them.

| Surface ID | Default | Modes | Covers |
|---|---|---|---|
| `youtube.home-feed` | `off` | `remove`, `off` | The recommendation grid on the home page. Off by default, because the home feed is where many people pick background listening. |
| `youtube.shorts` | `remove` | `remove`, `friction`, `off` | Shorts shelves, and the Shorts player. A shared Short opens as a normal video, unless the mode is `off`. |
| `youtube.recommendations` | `remove` | `remove`, `off` | The "Up next" sidebar and end screens on video pages |
| `facebook.feed` | `remove` | `remove`, `off` | The feed on the home page. The Feeds page (All, Favorites, Friends, Groups, Pages), which only shows sources you follow, stays. |
| `facebook.reels` | `friction` | `friction`, `off` | The Reels player, and the old Video tab (`/watch`), which now redirects to Reels. A link to a specific video opens normally. |

## The prompt

- Title: **"Why are you opening {name}?"** For example, "Why are you opening YouTube Shorts?"
- **Go back** is the main action and has focus. It returns to the last page outside the surface, or to a safe page if there isn't one.
- **Continue** unlocks after the wait (default 15 seconds, counted only while the page is visible). It opens the surface for a pass (default 5 minutes).
- When a pass runs out while the surface is open, the prompt returns: **"Your time with {name} is up."**
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

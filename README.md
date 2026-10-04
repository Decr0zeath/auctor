<h1 align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/logo-dark.svg">
    <img src="brand/logo.svg" alt="Auctor" width="140">
  </picture>
</h1>

<p align="center"><em>Be the author of your attention.</em></p>

> **Status:** the browser extension (phase 1) in [`apps/extension`](apps/extension) is going to the Chrome Web Store, unlisted at first. Daily limits come in a later update. This README records decisions as they're made.

Auctor removes "brain rot", the infinite, algorithmic, short-form feeds, while keeping the useful parts of the same sites and apps: search, subscriptions, messages, groups, specific videos.

## Decisions

| | |
|---|---|
| Name | **Auctor**, the Latin root of both "author" and "authority" |
| What we build | A **browser extension** (desktop) and an **Android app** that works inside native apps, since mobile-web workarounds aren't enough. No iOS or Mac. |
| Build order | Extension first, kept small so it doesn't delay Android, where most of the scrolling happens |
| v1 targets | YouTube and Facebook |
| Audience | Me first, then published and shared |
| Approach | **Remove** feeds you land on, add **friction** to feeds you choose to enter, offer optional **limits** ([research](#research)) |
| License | GPL-3.0 ([why](#license)) |
| Repo | One monorepo for both apps: `github.com/Decr0zeath/auctor`, public since the extension went to the store, so its [privacy policy](PRIVACY.md) can be read and checked against the code |
| Release | **Unlisted first** on the Chrome Web Store: it goes through review and updates itself, but only people with the link can find it. Public once it's ready. Daily limits come in a later update. |
| Logo | Hervé Bazin's **authority point** ([concept](#logo-the-authority-point)) |
| The pause | A **2-minute** wait, then a 5-minute pass. Both are adjustable, the wait from 2 to 10 minutes, and loosening either waits 24 hours. Giving in from the post waits just as long. |
| YouTube home feed | **Left on by default**, because it's where I pick background listening while working (lectures, talks, music). Removing it stays available as a setting. |
| YouTube extras | **Off by default**, for people who want fewer pulls: search shelves, hover previews, thumbnails (swapped for a frame from the video, which can't be made to bait), view and subscriber counts, comments and live chat, the notifications bell, and the side menu. Each is its own setting, and turning one back off applies at once, without the 24-hour wait, since off is its default. Removing Up next also switches off autoplay, which would play what Up next showed. |
| Facebook navigation | **Only Home by default.** The top bar's search bar and its Reels, Marketplace, Groups, and Gaming tabs are removed. So are the home page's post composer, left sidebar, and right panel (ads, Contacts, Group chats). Each is its own setting. With the defaults, nothing is left to click under the top bar but the post's way back to the feed; to search, turn the search bar back on. |
| The post | **The Facebook feed becomes one post, changed every 10 minutes:** a public-domain painting or statue (knights, emperors, and heroes of myth and scripture such as Thor, Hercules, and Moses) with a quote from the Stoics or the Bible (King James Version) about time, discipline, and putting things off. Under it, the only thing to click is a way back to the feed in guilt-tripping words ("Succumb to temptation", "Abandon the vigil"). It opens the pause, which then says rather than asks: a statement such as "You are meant for more, not for this.", a few lines worded by the [research](#wording), and the usual wait. Each new post brings a different painting and a different quote, but refreshing never brings one sooner, because a post that changed on every refresh would be a feed of its own. YouTube's home feed gets it later. |

## Research

| Study | Finding | Implication |
|---|---|---|
| [Grüning et al., PNAS 2023](https://www.pnas.org/doi/abs/10.1073/pnas.2213114120) (~280 users, plus ~500 in an experiment) | one sec (a short wait plus an option to back out when opening an app): users backed out of 36% of opens and tried to open the apps 37% less often. **The back-out option mattered most.** *One author builds one sec.* | Friction at the entry point works, and the "still want to?" choice matters more than the delay |
| [Haliburton et al., CHI 2024](https://dl.acm.org/doi/10.1145/3613904.3642370) (1,039 users, ~13 weeks) | The effect lasted, but users who paused the tool **slipped back into overuse quickly** | Make turning it off slower than turning it on |
| [Allcott, Gentzkow & Song, AER 2022](https://www.aeaweb.org/articles?id=10.1257%2Faer.20210867) (~2,000 Android users, 12 weeks) | Self-set app limits, with **changes applied the next day**, cut screen time by 22 min/day (16%). An estimated 31% of social media use comes from self-control problems. | Limits work when set in advance and can't be undone in the moment |
| [Kovacs et al., CSCW 2021](https://arxiv.org/abs/2101.11743) (8,000+ HabitLab users) | Users **drifted to easier settings** while expecting to toughen up later | Delay changes that weaken protection |
| [Ruiz et al., MuC 2024](https://arxiv.org/abs/2407.18803) (30 users) | Having to react to every post improved recall, but **most found it frustrating** | Put friction at a feed's entry, not on every item |
| [Purohit et al., CHI 2023](https://dl.acm.org/doi/10.1145/3544548.3581187) | Removing Facebook's News Feed cut time on site by **64%**; limiting it to self-chosen sources cut it by **39%**. Some users feared missing out. | Removal is the strongest single intervention; a self-chosen feed eases the fear of missing out |
| [Lyngs et al., CHI 2020](https://arxiv.org/abs/2001.04180) (58 students) | Goal reminders ("why are you visiting?") and removing the News Feed both helped. Reminders were **often annoying**; removal left some fearing missing out. | Prompt at entry points, not on home pages you pass through to reach search |
| [Kovacs et al., CHI 2019](https://hci.stanford.edu/publications/2019/conservation/conservation-chi2019.pdf) (5,230 HabitLab users) | Time saved on targeted sites **mostly didn't shift** to other sites | Blocking YouTube and Facebook is a real saving |

### Wording

What the prompt says when you give in from the post. In Grüning et al. the option to back out did the most and the wait helped, so the words support those rather than carry the prompt alone.

| Study | Finding | How the prompt uses it |
|---|---|---|
| [Peng et al., Frontiers in Psychology 2023](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2023.1201631/full) (meta-analysis, 26 studies, 7,512 people) | Guilt appeals persuade a little. **Explicit guilt persuades less**, appeals to wider obligations beat blaming a person, and **suggesting a way to make amends** makes them stronger. | The guilt stays implicit, and every message names something better to do |
| [Tangney, Stuewig & Martinez, Psychological Science 2014](https://pmc.ncbi.nlm.nih.gov/articles/PMC4105017) (476 inmates, one year) | Guilt about what you did predicted **less** re-offending. Shame about who you are mostly fed **blaming others**. | It judges the scrolling, never the person: no "lazy" or "weak" |
| [Bryan et al., PNAS 2011](https://pmc.ncbi.nlm.nih.gov/articles/PMC3150938) | Asking about **being a voter** rather than **voting** raised turnout | It speaks to who you are ("You are meant for more", "You bow to no algorithm") |
| [Dolcos & Albarracín, European Journal of Social Psychology 2014](https://prod.lsa.umich.edu/psych/news-events/all-news/archived-news/2014/07/one-word-that-could-help-you-achieve-more.html) | Advice to yourself as **"you"** rather than "I" strengthened intentions and performance | Every message says "you" |
| [Miller et al., Human Communication Research 2007](https://doi.org/10.1111/j.1468-2958.2007.00297.x) | **Controlling language** ("you must") provokes reactance; a closing line saying the choice is yours reduced it | No "must" or "should", and every message ends by leaving the choice with you. The related ["but you are free" effect](https://open.lnu.se/index.php/metapsychology/article/view/2640) replicates poorly, so this is a courtesy, not a lever. |
| [Breines & Chen, PSPB 2012](https://pubmed.ncbi.nlm.nih.gov/22645164/) | **Self-compassion** after a failure raised the motivation to improve more than a boost to self-esteem did | It grants that the pull is human and that rest isn't weakness |
| [Epton et al., Health Psychology 2015](https://research.manchester.ac.uk/en/publications/the-impact-of-self-affirmation-on-health-behavior-change-a-meta-a/) (meta-analysis, 144 tests) | Reflecting on your **values** before a hard message made people less defensive and more likely to change | It points to what you value: family, work, health, the person you're becoming |
| [Terzimehić et al., DIS 2022](https://www.medien.ifi.lmu.de/pubdb/publications/pub/terzimehic2022dis/terzimehic2022dis.pdf) (28 people, two weeks) | At unlock, asking what you'll **do in the real world afterwards** cut absent-minded use; asking why you're using the phone only raised awareness | It names a real-world alternative: a walk, a call, a page of work |
| [Cozzolino et al., PSPB 2004](https://selfdeterminationtheory.org/SDT/documents/2004_CozzolinoStaplesMeyersSamoceti_PSPB.pdf) | **Reflecting** on death made people less greedy, where fear of death made some greedier | "Your days are numbered" is what makes them precious, not a threat |
| [Patrick & Hagtvedt, Journal of Consumer Research 2012](https://www.bauer.uh.edu/vpatrick/docs/dontversuscant.pdf) | Refusing with **"I don't"** rather than "I can't" helped people resist temptation | It speaks of choosing, not of being forbidden |

### Design principles

1. **Remove** feeds you land on without choosing (home feeds, Shorts shelves, recommendation sidebars). Add **friction** to feeds you choose to enter (the Shorts player, Reels, "show it anyway"). Offer optional daily **limits** set in advance. Never add friction to every scroll or post.
2. **The prompt offers a way out:** "Why are you opening this?" with **Go back** as the main action.
3. **Weakening protection is delayed.** Loosening a limit, pausing, or uninstalling takes effect tomorrow or after a cooldown; tightening is immediate. Never offer "easier" in the moment. Optional limits, off by default, are the exception: turning one off only goes back to the default.
4. **Breaks are visible and short.**
5. **Ease the fear of missing out:** replace a removed feed with one you chose, such as YouTube Subscriptions.
6. **Same behavior everywhere:** a surface gets the same treatment in the browser and on the phone.

## v1 surfaces

A **surface** is one brain-rot entry point in a site or app, with a stable ID shared by both apps.

| Surface ID | Default | Extension | Android |
|---|---|---|---|
| `youtube.home-feed` | Off | When set to Remove: hide the recommendation grid on `/`; keep search and link to Subscriptions. "Show anyway" goes through friction. | Overlay the Home tab with shortcuts to Search, Subscriptions, and Library |
| `youtube.shorts` | Remove the tab and shelves, friction to enter | Hide Shorts in the menu, and Shorts shelves in home, search, and subscriptions. Open shared `/shorts/<id>` links as `/watch?v=<id>`: that one video, without the endless swipe. Friction on the Shorts player (`/shorts/*`), which still opens from links and a channel's Shorts tab. | Detect the Shorts player and show friction |
| `youtube.recommendations` | Remove | Hide the "Up next" sidebar and end screens, and switch off autoplay | Later |
| `youtube.search-shelves` | Off | Hide the shelves of other videos in search results | Later |
| `youtube.previews` | Off | Hide and pause the video that plays when you point at a thumbnail | Later |
| `youtube.thumbnails` | Off | Swap the thumbnail a channel chose for a frame from the middle of the video | Later |
| `youtube.counts` | Off | Hide view, like, and subscriber counts | Later |
| `youtube.comments` | Off | Hide comments, and live chat beside streams | Later |
| `youtube.notifications` | Off | Hide the bell in the top bar | Later |
| `youtube.menu` | Off | Hide the side menu and its ☰ button | Later |
| `facebook.feed` | Remove | Hide the feed on `/`, below the post composer and stories, and keep navigation. In its place, the [post](docs/surfaces.md#the-post). The Feeds page (`/?filter=…`: All, Favorites, Friends, Groups, Pages) only shows sources you follow, so it stays. | Overlay the feed with shortcuts to Groups, Marketplace, Notifications, and Messenger |
| `facebook.composer` | Remove | Hide the "What's on your mind?" box on `/`. Posting still works from your profile. | Later |
| `facebook.stories` | Remove the row, friction to enter | Hide the stories row (My Day) on `/`. Friction on the stories viewer (`/stories/*`), which opens from the row or a profile picture. Making your own story (`/stories/create/`) stays open. | Detect the stories viewer and show friction |
| `facebook.reels` | Remove the links, friction to enter | Hide Reels in the top bar and the left sidebar. Friction on `/reel/*`, `/reels/*`, and the old Video tab (`/watch`), which Facebook now redirects to Reels. | Detect the Reels viewer |
| `facebook.marketplace` | Remove | Hide Marketplace in the top bar and the left sidebar | Later |
| `facebook.groups` | Remove | Hide Groups in the top bar and the left sidebar; shortcuts to single groups stay | Later |
| `facebook.gaming` | Remove | Hide Gaming in the top bar, and Gaming Video and Play games in the left sidebar | Later |
| `facebook.search` | Remove | Hide the search bar in the top bar | Later |
| `facebook.sidebar` | Remove | Empty the left sidebar on `/`, keeping its width so the page stays centered | Later |
| `facebook.sponsored` | Remove | Hide the ads in the right panel on `/` | Later |
| `facebook.contacts` | Remove | Hide the Contacts and Group chats lists in the right panel on `/` | Later |

- **Always allowed:** YouTube search, subscriptions, playlists, and specific videos. Facebook messages, groups, Marketplace, profiles, events, and notifications. Removing a top bar tab or sidebar link only hides the link; the pages still open from search, links, and notifications. Removing Contacts hides the list, not Messenger.
- **Facebook is the hard target on both platforms.** Its web HTML uses randomized class names, so we rely on URLs and ARIA roles. Its Android app exposes few stable view IDs, so we may have to match on-screen labels, which change with the phone's language.
- **Android can't edit another app's screen,** so there "remove" means covering it with our own overlay of useful shortcuts.

## Repo structure

A monorepo using the common `apps/` layout (as in Bitwarden's clients repo):

```
├── .github/
│   ├── workflows/              ← one CI workflow per app, triggered by changes in its folder
│   ├── ISSUE_TEMPLATE/         ← bug, broken site, feature request
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── dependabot.yml          ← npm and Gradle updates
├── apps/
│   ├── extension/              ← TypeScript, Manifest V3 (Chrome, Edge, Brave, Firefox)
│   └── android/                ← Kotlin + Gradle
├── docs/
│   ├── surfaces.md             ← surface catalogue: the contract both apps follow
│   ├── research.md             ← the studies in more detail
│   └── adr/                    ← Architecture Decision Records
├── .editorconfig, .gitattributes, .gitignore
├── package.json, pnpm-workspace.yaml   ← pnpm workspace for the JavaScript apps
├── CODE_OF_CONDUCT.md          ← Contributor Covenant
├── CONTRIBUTING.md
├── LICENSE
├── PRIVACY.md                  ← required by the Chrome Web Store and Google Play
├── README.md
└── SECURITY.md                 ← private vulnerability reporting
```

| Area | Standard |
|---|---|
| Commits | [Conventional Commits](https://www.conventionalcommits.org/) scoped by app: `feat(extension): …`, `fix(android): …` |
| Versioning | [Semantic Versioning](https://semver.org/), per app |
| Releases | [release-please](https://github.com/googleapis/release-please) in monorepo mode: one release PR and changelog per app, tagged `extension-v1.2.0` / `android-v1.2.0` |
| Branching | Protected `main`; changes go through pull requests, and CI must pass |
| Decisions | The Decisions table moves into `docs/adr/` once code starts |
| Extension tooling | TypeScript (strict), [WXT](https://wxt.dev/) (cross-browser Manifest V3 on Vite), pnpm, ESLint + Prettier, Vitest, Playwright end-to-end tests with the extension loaded |
| Android tooling | Kotlin, Gradle Kotlin DSL with a version catalog (`gradle/libs.versions.toml`), Jetpack Compose for settings, ktlint or detekt, JUnit |

The two apps **share** surface IDs, friction behavior, prompt wording, and the settings format, all defined in `docs/surfaces.md`. They **don't share** code or detection rules (URLs and CSS selectors versus Android view IDs); each app keeps its rules as data files. Settings move between devices by JSON export and import, which is simpler than a sync server and stays offline.

### Identifiers

One lowercase name, `auctor`, everywhere.

| | |
|---|---|
| Repo description | *Be the author of your attention. Removes the feeds you land on, adds friction to the ones you enter. Browser extension + Android app. GPL-3.0.* |
| Repo topics | `digital-wellbeing`, `doomscrolling`, `browser-extension`, `manifest-v3`, `android`, `kotlin`, `youtube-shorts`, `facebook`, `screen-time` |
| Android app ID | `io.github.decr0zeath.auctor`, **permanent once published on Play** |
| Store name | `Auctor — Remove Feeds, Shorts & Reels` (the descriptor helps search) |
| Package names | `@auctor/extension`, internal only; nothing is published to npm |

## License

**GPL-3.0**, a copyleft license. Anyone may use, change, share, or sell the code, but anyone who distributes it or a modified version must publish the full source under GPL-3.0 and keep the copyright notice. Private modifications are unrestricted, and the copyright holder can still publish to stores, charge money, or relicense their own code (relicensing contributors' code needs their agreement). It also includes a patent grant from contributors.

Why not MIT:
- **Trust is the product.** The Android app can see your screen. Under MIT, someone could fork it, add tracking, and ship it closed-source. GPL-3.0 doesn't prevent a bad fork, but it makes one impossible to hide.
- **It's the norm** for privacy tools like uBlock Origin and NewPipe.
- **Its cost**, that companies can't reuse the code in closed products, doesn't matter here.

See [choosealicense.com](https://choosealicense.com/licenses/gpl-3.0/). *A summary, not legal advice.*

## Roadmap

| Phase | Scope | Status |
|---|---|---|
| 0 | Repo setup: the files and conventions above, plus `docs/surfaces.md` | Workspace, license, CI, `docs/surfaces.md`, and `PRIVACY.md` done. Community files and templates to do. |
| 1 | Browser extension for YouTube and Facebook: removal, friction, optional limits | Removal, friction, and delayed changes built, and going to the Chrome Web Store unlisted ([listing](apps/extension/store/listing.md)). Daily limits come in [0.2.0](#extension-020). |
| 2 | Android app for YouTube and Facebook with the same surfaces and behavior (**the main target**) | |
| 3 | More apps: Instagram, TikTok, X, Reddit | |

### Extension 0.2.0

**Facebook: "Menu and notifications"**, one setting, Remove by default
- [ ] Hide the Menu button (the 3×3 grid) in the top bar. Its pop-up links to Reels, Marketplace, Groups, and Gaming.
- [ ] Notifications ignore clicks, in the bell's pop-up and on `/notifications`; the bell still opens the list. CSS only, so the keyboard still gets through.
- [ ] Update the comment on `css` in `src/sites/types.ts`, which says it's only for what hiding leaves behind.

**YouTube: a daily watch limit**
- [ ] Count time only while a video plays and its tab is visible. A background tab or a minimized window doesn't count; picture-in-picture does, and so does a video on a second screen, since the browser can't tell where you're looking. Shorts count, and two tabs playing at once count once.
- [ ] At the limit, videos are blocked until midnight, with Go back as the only button. A warning comes shortly before.
- [ ] The setting: off, 1, 2, or 3 hours, off by default. Lowering it is instant. Raising it or turning it off waits 24 hours, unlike other settings that are off by default, so record the exception in the [design principles](#design-principles).
- [ ] Define its rules in `catalog/`, so the Android app follows them.

**Checks**
- [ ] YouTube search pages that Shorts fill: do more results load, or does the page stay empty?
- [ ] A "broken site" issue template, now that the store's support link points to issues.

**Release**
- [ ] Settings storage migration to version 3, and settings files exported from 0.1.0 still import.
- [ ] `docs/surfaces.md` and the surface tables in this README.
- [ ] `PRIVACY.md` and `store/listing.md`: the stored watch time, and recheck the data-usage answer.
- [ ] Screenshots of the new settings screen and the limit screen.
- [ ] Tests: unit tests for counting and the midnight reset, an end-to-end test with a very short limit, and a pass by hand on Facebook.
- [ ] `version` 0.2.0, `pnpm zip`, upload, and tag `extension-v0.2.0`.

## Technical notes

### Extension
- **URL rules first, DOM hiding second.** URL rules (`/shorts/<id>` → `/watch?v=<id>`) are stable. CSS selectors break whenever a site changes its layout and are the main maintenance cost.
- One content script handles every site, starting at `document_start`. It rewrites shared links itself instead of using `declarativeNetRequest`, which keeps `storage` the only permission. Because YouTube and Facebook are single-page apps, it also watches for in-app URL changes.
- Hiding is a stylesheet, so content that loads later is hidden without watching the DOM. Only rules that change the page, such as swapping thumbnails or switching autoplay off, watch it, once a frame at most.
- Site rules live in data files, separate from logic, so fixing a broken site is a one-line change. Adding a site is one rules file ([how](apps/extension/README.md#adding-a-site)).

### Android
- An **`AccessibilityService`**, limited through `packageNames` to YouTube (`com.google.android.youtube`) and Facebook (`com.facebook.katana`) for privacy and battery.
- The friction screen is a `TYPE_ACCESSIBILITY_OVERLAY`, so it needs no "draw over other apps" permission. **Go back** calls `GLOBAL_ACTION_BACK`.
- **No `INTERNET` permission.** The service sees the screen, so being unable to send data anywhere is a promise anyone can verify. Trade-off: rule fixes ship as app updates.
- The apps change their view IDs often, so expect rules to break and keep them as data.

### Distribution
- **Extension:** Chrome Web Store ($5 once), Firefox Add-ons and Edge Add-ons (free), all from the same Manifest V3 code with minor changes.
- **Google Play:** $25 once. [Accessibility-based Shorts blockers are allowed](https://play.google.com/store/apps/details?id=com.muuu.unshort&hl=en_US), but need a prominent disclosure, user consent, a declaration form, and a stricter review.
- **Outside Play (GitHub releases, F-Droid):** on Android 13+, users must turn on "Allow restricted settings" before a sideloaded app can use accessibility. [Developer verification](https://android-developers.googleblog.com/2026/03/android-developer-verification-rolling-out-to-all-developers.html) also applies (from September 30, 2026 in some countries, worldwide in 2027): apps must come from a verified developer to install normally. A [free limited-distribution account](https://www.androidauthority.com/android-sideloading-changes-timeline-3679204/) covers up to 20 devices, enough for personal use.

## Logo: the authority point

In *Plumons l'oiseau* (1966), Hervé Bazin proposed six new punctuation marks, none of which caught on. His **point d'autorité** is an exclamation mark with a cap that sits over a sentence *"comme un parasol sur le sultan"* ("like a parasol over the sultan"), marking a statement made with authority, such as an order or a verdict (p. 142, reproduced in [Unicode proposal L2/11-232R](http://www.unicode.org/L2/L2011/11232r-sup-punct-proposal.pdf)).

It fits because the app speaks with the authority of your calm, planning self over your impulsive, scrolling self, which is how the research says limits work. The cap also shelters you from the feed. The mark was proposed for Unicode in 2011 but apparently never encoded, so it's drawn, in [`brand/`](brand):

| File | What it is |
|---|---|
| `mark.svg` | The authority point alone. The settings screen shows it beside the name. |
| `logo.svg`, `logo-dark.svg` | The mark over the name, for light and dark backgrounds. The name is set in Cinzel, the post's typeface for who said it. |
| `icon.svg` | The app icon: the mark on an ink tile. The extension's icons in `apps/extension/public/` are rendered from it, with the mark drawn larger and a little bolder at small sizes so the stem stays visible. |

The colors are the settings screen's text colors: `#1c1b1a` on light backgrounds and `#f2f0ec` on dark ones.

## Existing tools

The space is crowded:
- **Browser:** Unhook, News Feed Eradicator, UnDistracted, and Escape the Algorithm hide feeds. LeechBlock NG blocks sites on a schedule. HabitLab is Stanford's research extension, the source of two studies above.
- **Android:** un:short, ScrollBreak, Blokr, Sprout, and Blockify block Shorts and Reels via accessibility. one sec, ScreenZen, and SpeedBump add friction before opening an app.
- **YouTube** [added a daily Shorts limit](https://techcrunch.com/2025/10/22/youtube-adds-at-timer-for-you-to-stop-scrolling-shorts) in October 2025, but it can be turned off at any time.

| Closest competitor | What it does | Overlap |
|---|---|---|
| [ShortStop](https://github.com/YameenMunir/ShortStop) (open-source extension) | Blocks Shorts, Reels, and feeds on YouTube, Facebook, Instagram, TikTok, and more. Search and messages work; no tracking or network requests. | **Very high for phase 1**, but it only blocks: no friction, limits, or delayed changes |
| [Shortstop](https://play.google.com/store/apps/details?id=com.ladeon.shortstop) (Android, unrelated) | Blocks Shorts and Reels in apps, including Facebook Reels | High for phase 2; only blocks |
| [Unreel](https://play.google.com/store/apps/details?id=app.unreel.blockreelsshorts) (Android) | Exits Shorts and Reels as they open; DMs and search work | High for phase 2; only blocks |
| [Ekagra](https://play.google.com/store/apps/details?id=com.focus.ekagra) (Android) | A calm full-screen pause when opening a blocked app or Shorts/Reels | Friction like ours |
| [brainrot-meter](https://github.com/hajar-benhadj/brainrot-meter) | Measures how brain-rotting your feed is, on the same stack (WXT + Kotlin/Compose) | Measures rather than intervenes; a useful reference |

**What sets Auctor apart:**
- **It follows the research** by combining removal, friction, and optional limits. Competitors pick one: ShortStop, Shortstop, and Unreel block; Ekagra and one sec add friction.
- **Delayed changes that weaken protection**, which no competitor above advertises.
- **GPL-3.0 and no internet permission on Android,** so the privacy claim can be checked.
- **The same surfaces and behavior** on desktop and phone, in one project.

## Open questions

- [ ] Final name check of "Auctor" on GitHub, the Chrome Web Store, Google Play, Firefox Add-ons, and USPTO/EUIPO (earlier checks were light web searches; no Chrome Web Store extension was named Auctor on 2026-10-04)
- [ ] A weekly summary (times you turned back, time saved)?

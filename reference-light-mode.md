# Reference: light mode with a System / Light / Dark picker

Palette **A, Warm paper**. `spa-lab.html` and `guide-repro.html` stay dark.

---

## What changes, and where

| File | Change |
|---|---|
| `assets/styles.css` | Tokens become `light-dark()` pairs; `color-scheme: light dark` on `:root`; 3 new tokens replace the hard-coded colours |
| `assets/theme.js` | **New.** Applies the saved choice before first paint |
| 7 pages\* | Remove `style="color-scheme: dark;"`, add `<script src="assets/theme.js">` |
| `settings.html` | Replace the disabled theme radios with System / Light / Dark |
| `assets/app.js` | ~10 lines at the end of `initSettings()` |

\* `dashboard`, `contacts`, `contact-detail`, `tickets`, `ticket-detail`, `settings`, `shadow-lab`.
**Not** `spa-lab.html` or `guide-repro.html`. They keep their inline `color-scheme: dark`, so the
shared tokens resolve dark there and match their hard-coded greys.

---

## How it fits together

```
theme.js (in <head>)           styles.css                       every element
──────────────────────         ───────────────────────────      ─────────────────────
reads localStorage      ──►    :root { color-scheme: ... }  ──► var(--bg-page)
sets html.style.colorScheme    --bg-page: light-dark(A, B)       resolves to A or B
  'light' | 'dark' | (unset)
```

One property, `color-scheme`, decides the mode for the whole page. `light-dark(lightValue, darkValue)`
reads it. Unset means the `:root` default `light dark` applies, which means follow the OS.

Why drive it through `color-scheme` and not a `data-theme` attribute with two palette blocks:

1. **One palette, not two.** Each token holds both values on one line, so light and dark can't drift
   apart.
2. **System mode needs no JavaScript.** The browser tracks OS changes itself. With `data-theme` you'd
   need a `matchMedia` listener to follow the OS live.
3. **It's the property embedded content sees.** Native form controls, scrollbars, and how an embedded
   iframe's `prefers-color-scheme` resolves all key off `color-scheme`. So your picker controls what the
   ideas portal and any other embedded Pendo content sees. That's the test you want.

The trade-off: `light-dark()` needs Chrome 123+, Safari 17.5+ or Firefox 120+. On anything older the
tokens are invalid and the page loses its colours. That's fine for a sandbox, but worth knowing if a
customer ever reports "colours missing on one machine".

---

## Step 1 — `assets/styles.css`

### 1a. Replace the whole `:root { ... }` block at the top

```css
:root {
  /* Default = follow the OS. theme.js overrides this on <html> when the user
     picks Light or Dark. light-dark(LIGHT, DARK) resolves against it. */
  color-scheme: light dark;

  --bg-page:               light-dark(#F6F4EE, #181C1A);
  --bg-box:                light-dark(#FFFFFF, #1F2522);
  --bg-box-hover:          light-dark(#F1EFE8, #232A26);
  --border-box:            light-dark(#E2DFD5, #2A312D);
  --text-primary:          light-dark(#1F2522, #E8E6DD);
  --text-secondary:        light-dark(#6B7069, #7A8079);

  --bg-sidebar:            light-dark(#EDE9DF, #141210);
  --bg-surface:            light-dark(#E4DFD3, #232019);
  --bg-surface-active:     light-dark(#DCD6C8, #2A2620);
  --border:                light-dark(#DCD6C8, #2A2620);
  --sidebar-text-primary:  light-dark(#2A2620, #EDE6D8);
  --sidebar-text-secondary: light-dark(#6E6458, #8C8074);

  --bg-sage-soft:          light-dark(#E3ECE3, #2D3A2D);
  --bg-brown-soft:         light-dark(#F1E6D8, #3D2E20);
  --bg-gray-soft:          light-dark(#ECECE8, #2A2A28);
  --gray-text:             light-dark(#6E6E68, #989890);

  /* Sage and brown are used as TEXT ~23 times. The dark-mode values are only
     ~2.3:1 contrast on a light background, so light mode uses darker versions
     (both ~5:1). */
  --sage:                  light-dark(#4F7A4F, #8FAE8F);
  --sage-bright:           light-dark(#3E6A3E, #A8C5A8);  /* hover: darker in light, lighter in dark */
  --brown:                 light-dark(#8A6232, #C9A57A);
  --brown-deep:            light-dark(#F6F4EE, #3D2E20);  /* the dot inside the brand mark */

  --bg-priority-high:      light-dark(#F6E1DC, #3D2424);
  --priority-high:         light-dark(#A2402C, #D89E8A);
  --bg-priority-med:       light-dark(#F7EFCF, #3D3520);
  --priority-med:          light-dark(#7A5F00, #FFD908);
  --bg-priority-low:       light-dark(#E8F0D8, #2A3520);
  --priority-low:          light-dark(#4F6B1F, #B5C97A);

  /* New: these replace the hard-coded colours found below :root */
  --avatar-hover:          light-dark(#E8D9C4, #4A382A);
  --shadow-color:          light-dark(rgba(0, 0, 0, 0.12), rgba(0, 0, 0, 0.45));
  --backdrop:              light-dark(rgba(31, 37, 34, 0.35), rgba(0, 0, 0, 0.6));
}
```

### 1b. Swap the nine hard-coded colours for tokens

Search each **find** string in the file (Cmd+F). Line numbers move as you edit, so search by text rather
than line number.

| Find | Replace with |
|---|---|
| `button.user-avatar:hover { background: #4A382A; }` | `button.user-avatar:hover { background: var(--avatar-hover); }` |
| `.metric-trend.down { color: #D89E8A; }` | `.metric-trend.down { color: var(--priority-high); }` |
| `background: rgba(0, 0, 0, 0.6);` (modal backdrop) | `background: var(--backdrop);` |
| every `box-shadow: ... rgba(0,0,0,0.45)` / `0.45` / `0.5` / `0.55` (six of them) | keep the offsets and blur, swap the colour for `var(--shadow-color)` |

For example:

```css
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);     /* before */
box-shadow: 0 8px 24px var(--shadow-color);     /* after  */
```

Two of the six used a slightly heavier 0.5 and 0.55 in dark mode. With one token they all become 0.45.
That's a barely visible change. If you want those two kept heavier, add a `--shadow-color-strong`
token and use it for them instead.

Quick check when you're done. This should print nothing:

```bash
awk '/^}/ && !done {done=1; next} done' assets/styles.css | grep -n "#[0-9A-Fa-f]\{6\}\|rgba("
```

It lists any hex or rgba colour that remains after the `:root` block closes.

### 1c. Optional tidy-up

`.theme-options label.disabled { ... }` is no longer used once Step 3 is done. You can delete it, but
leaving it does no harm.

---

## Step 2 — new file `assets/theme.js`

```js
/* ============================================================
THEME — runs in <head>, before first paint.

Why <head> and not the bottom of <body> like app.js: anything at the end of
<body> runs AFTER the browser has painted once. A dark-mode user would see a
light flash on every page load (FOUC — flash of unstyled content). This file is
tiny and render-blocking on purpose.

Wrapped in an IIFE so nothing leaks into the global scope except the one
deliberate export, window.billycrmTheme.
============================================================ */
(function () {
  const KEY = 'billycrm-theme';                    // 'system' | 'light' | 'dark'
  const root = document.documentElement;

  function apply(choice) {
    if (choice === 'light' || choice === 'dark') {
      root.style.colorScheme = choice;              // inline style beats :root
    } else {
      root.style.removeProperty('color-scheme');    // back to CSS default: light dark
      choice = 'system';
    }
    root.dataset.themeChoice = choice;              // handy in DevTools / for Pendo
  }

  let saved = 'system';
  try {
    saved = localStorage.getItem(KEY) || 'system';
  } catch (e) {
    console.warn('[theme] localStorage unavailable, using system theme', e);
  }
  apply(saved);

  window.billycrmTheme = {
    get() {
      return root.dataset.themeChoice || 'system';
    },
    set(choice) {
      try { localStorage.setItem(KEY, choice); } catch (e) {}
      apply(choice);
    },
    // What's actually on screen right now. Differs from get() only when 'system'.
    resolved() {
      const c = this.get();
      if (c !== 'system') return c;
      return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }
  };
})();
```

Note the `console.warn` in the `catch`. It's the same fix suggested for `pendoSnippet.js`: an empty
`catch {}` hides why the theme didn't stick.

---

## Step 3 — the seven pages

Same two edits on `dashboard`, `contacts`, `contact-detail`, `tickets`, `ticket-detail`, `settings`,
`shadow-lab`.

**Line 2:**

```html
<html lang="en" style="color-scheme: dark;">     <!-- before -->
<html lang="en">                                  <!-- after  -->
```

**After the viewport `<meta>` (line 5), add theme.js first, ahead of `pendoSnippet.js`:**

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="assets/theme.js"></script>
```

### Doing all seven at once in VS Code

Cmd+Shift+H, then click the `…` to show **files to include**, and paste:

```
dashboard.html,contacts.html,contact-detail.html,tickets.html,ticket-detail.html,settings.html,shadow-lab.html
```

That list keeps `spa-lab.html` and `guide-repro.html` out.

1. Find `<html lang="en" style="color-scheme: dark;">`, replace with `<html lang="en">`. Replace all.
2. Turn on regex (the `.*` button). Find
   `(<meta name="viewport" content="width=device-width, initial-scale=1.0">)`
   and replace with `$1\n<script src="assets/theme.js"></script>`. Replace all.

Then confirm: `grep -c "theme.js" *.html` should show `1` for exactly those seven files.

---

## Step 4 — `settings.html`

Inside the **Display** section, replace the whole `settings-row` that contains "Light mode coming soon":

```html
        <div class="settings-row">
          <div class="settings-row-text">
            <div class="settings-row-label">Theme</div>
            <div class="settings-row-hint">System follows your operating system setting</div>
          </div>
          <div class="theme-options" role="radiogroup" aria-label="Theme">
            <label><input type="radio" name="theme" value="system" id="theme-system" /> System</label>
            <label><input type="radio" name="theme" value="light"  id="theme-light"  /> Light</label>
            <label><input type="radio" name="theme" value="dark"   id="theme-dark"   /> Dark</label>
          </div>
        </div>
```

There's no `checked` attribute in the HTML on purpose. The saved choice lives in `localStorage`, so JS
sets the checked state on load (Step 5). Hard-coding `checked` would show the wrong radio as selected
for anyone who'd changed it.

The `id`s give you stable Pendo selectors (`#theme-light`) rather than
`input[name="theme"][value="light"]`.

---

## Step 5 — `assets/app.js`

At the **end** of `initSettings()`, just before its closing `}`:

```js
  // Theme picker. Applies immediately with no Save button, the way OS-level
  // pickers behave. The theme itself was already applied by theme.js in <head>;
  // this only syncs the radios and handles changes.
  const themeChoice = window.billycrmTheme?.get() || 'system';
  document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.checked = radio.value === themeChoice;
    radio.addEventListener('change', e => {
      window.billycrmTheme?.set(e.target.value);
      showToast(`Theme: ${e.target.value}`);
    });
  });
```

`?.` is there for the same reason as elsewhere in `app.js`: if a page ever loads `app.js` without
`theme.js`, this degrades to doing nothing instead of throwing.

---

## Testing

```bash
python3 -m http.server 8080
```

1. **Settings → Light.** The whole app goes light, and stays light on reload and on every other page.
2. **Settings → Dark.** Back to how it is today.
3. **Settings → System.** Now test following the OS without changing your Mac's settings: DevTools →
   Cmd+Shift+P → type **Rendering** → *Emulate CSS media feature prefers-color-scheme* → switch between
   light and dark. The page should follow live, with no reload.
4. **spa-lab.html and guide-repro.html** stay dark whatever you pick.
5. **Shadow lab.** The sidebar's shadow roots follow too: custom properties and `color-scheme` both
   inherit across shadow boundaries. The `#D08A6A` warning text in `shadow-lab.js` is hard-coded and a
   bit faint on light. Swap it for `var(--priority-high)` if it bothers you.

### Checking what the ideas portal sees

This is the test you built the picker for.

1. Open the Resource Center or ideas portal in each of the three modes and compare.
2. If it renders in an iframe, select the `<iframe>` element in the **Elements** panel and look at the
   **Computed** tab for `color-scheme`. That's what the embedded document's `prefers-color-scheme`
   resolves against in Chrome.
3. Pendo guides built in the designer should look identical in all three modes, because their colours
   are explicit values. If one changes, it's either web content inheriting the host's scheme, or the
   guide's CSS using system colours. Both are worth knowing about for a customer ticket.

---

## Adjacent ideas

**Theme as Pendo metadata.** Pendo can't tell which mode a visitor is in. If a customer wants different
guides for dark-mode users, or wants to know whether an issue only affects dark mode, the app has to
send it. `theme.js` loads before `pendoSnippet.js`, so this works:

```js
visitor: {
  id: visitor.id || '',
  // ...
  theme: window.billycrmTheme?.resolved()
}
```

`resolved()` sends what's actually on screen (`light` or `dark`), not the setting (`system`), which is
what you'd want to segment on. One catch: it's captured at `initialize`, so switching theme mid-session
won't update it until the next page load or a `pendo.updateOptions()` call. Not building this now,
but it comes up as a customer question.

**FOUC, generally.** The rule of "anything that changes how the page looks before first paint goes in
`<head>` and blocks" applies well beyond themes: feature flags that hide UI, A/B test variants, and
language selection all have it. It's also why Pendo's own snippet goes in `<head>`.

---

## Commit

```bash
git switch -c feat/light-mode
git add assets/styles.css assets/theme.js assets/app.js settings.html \
        dashboard.html contacts.html contact-detail.html tickets.html \
        ticket-detail.html shadow-lab.html
git status            # confirm spa-lab.html and guide-repro.html are NOT staged
git commit -m "feat: light mode with system/light/dark picker"
git push -u origin feat/light-mode
```

`git status` before committing is the habit worth keeping here: with eleven files across a
find-and-replace, it's your check that the replace didn't touch the two pages you excluded.

GitHub Desktop: *Branch → New Branch*, untick any unexpected files in the Changes list, commit,
*Publish branch*.

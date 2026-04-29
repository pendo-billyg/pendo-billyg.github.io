# BillyCRM

A fake CRM web app used as a sandbox for testing the Pendo agent.

## Pages

- **Dashboard** — overview metrics and recent activity
- **Contacts** — list, search, filter, add/edit, detail view
- **Tickets** — list, search, two filters, add/edit, detail view, customer link-through
- **Settings** — profile, notifications, theme info

## Run locally

```
python3 -m http.server 8080
```

Then open <http://localhost:8080/>.

## Install Pendo

1. Open `assets/pendoSnippet.js`
2. Replace `YOUR_API_KEY_HERE` with your real Pendo subscription key
3. Reload any page — the agent will load and identify whoever's signed in via the top-right avatar

The visitor and account IDs persist in `localStorage` (key: `billycrm-auth`) so signing in once survives reloads. Sign in via the avatar dropdown — Visitor ID and Account ID are required, the rest are optional metadata.

## Project structure

```
billycrm/
├── index.html             (redirects to dashboard.html)
├── dashboard.html
├── contacts.html
├── contact-detail.html
├── tickets.html
├── ticket-detail.html
├── settings.html
└── assets/
    ├── styles.css
    ├── app.js             (shared logic + page dispatcher)
    └── pendoSnippet.js    (Pendo install snippet)
```

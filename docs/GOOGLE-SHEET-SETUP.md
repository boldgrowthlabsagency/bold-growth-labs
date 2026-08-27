# Enquiries → Google Sheet

Everything on the site side is already built and tested. What's left is three
things only you can do, because they happen inside your Google account.

**Roughly 10 minutes.** Steps 1–2 are yours, step 3 you hand back to me.

---

## How it works

```
visitor submits  →  boldgrowthlabs.io/api/contact  →  Apps Script  →  your Sheet
                         (your server)                                  + email to you
```

The Apps Script URL is a **write endpoint with no password on it**. Anyone who
has it can append rows to your spreadsheet forever. That's why the site posts to
its own server first and the server holds the URL — it never reaches the
browser, so it can't be scraped out of the page source.

---

## Step 1 · Create the sheet and add the script

1. Go to **[sheets.new](https://sheets.new)** — this makes a blank spreadsheet.
2. Name it something you'll recognise, e.g. **BOLD Growth Labs — Enquiries**.
3. In the menu: **Extensions ▸ Apps Script**. A code editor opens in a new tab.
4. Delete the placeholder `function myFunction() {}` so the file is empty.
5. Open **`docs/google-sheet-script.gs`** from this project, copy the whole
   file, and paste it in.
6. Click the **save icon** (or ⌘S). Name the project anything.

> Don't create the header row yourself. The script writes it on the first
> submission and freezes it.

---

## Step 2 · Deploy it as a Web App

Still in the Apps Script editor:

1. Top right: **Deploy ▸ New deployment**
2. Click the **gear icon** next to "Select type" → choose **Web app**
3. Fill in:
   - **Description** — `Website enquiries`
   - **Execute as** — **Me (your@gmail.com)**
   - **Who has access** — **Anyone**
4. Click **Deploy**
5. Google asks you to authorise. Click **Authorize access**, pick your account,
   then **Advanced ▸ Go to (project name) (unsafe) ▸ Allow**.
6. Copy the **Web app URL**. It looks like:

   ```
   https://script.google.com/macros/s/AKfycb.................../exec
   ```

### On the two settings that trip people up

**"Execute as: Me"** is what lets the script write to *your* sheet and send mail
from *your* account. Set to "User accessing", every anonymous visitor would need
a Google account and permission to your spreadsheet — it would simply fail.

**"Who has access: Anyone"** sounds alarming but is required: your Vercel server
calls this without being logged into Google. It exposes only what the script
does — append a row and send you mail. It cannot read the sheet back out.

**The scary warning screen is expected.** "Google hasn't verified this app" just
means you wrote it yourself and didn't submit it for review. You're authorising
your own code.

---

## Step 3 · Send me the URL

Paste the `/exec` URL back to me. I'll add it to Vercel as `SHEETS_WEBHOOK_URL`
(server-side, encrypted, not exposed to the browser) and redeploy.

You can sanity-check it first by opening the URL in a browser — it should say
*"BOLD Growth Labs enquiry endpoint is running."* If you see that, it's live.

---

## What happens after

Each submission:

- **Appends a row** — Received, Name, Business, Email, Phone, Needs, Details, Source
- **Emails you** at `boldgrowthlabs@gmail.com`, with reply-to set to the
  enquirer, so hitting reply goes straight to them

The two are independent on purpose: if the notification fails, the row is still
written. The record is the thing that must not be lost.

---

## Already handled on the site side

| | |
|---|---|
| Same-origin POST | no CORS problems, webhook URL stays private |
| Honeypot | bot submissions return 200 but are silently dropped, never reaching the sheet |
| Validation | missing name or malformed email rejected before forwarding |
| Field caps | 2,000 characters per field, so nothing floods a cell |
| 9s timeout | a hanging Google request can't hang the visitor |
| Mail fallback | if the endpoint is unset or unreachable, the form opens the visitor's mail client rather than reporting a false success |

**Note:** this is only the real contact form on the main site. The three enquiry
forms inside the concept builds remain demonstrations that send nothing — those
are fictional businesses, and their submitted state says so plainly.

---

## Changing things later

**Different notification address** — edit `NOTIFY` at the top of the script,
then **Deploy ▸ Manage deployments ▸ edit ▸ Version: New version ▸ Deploy**.
Editing the code alone does nothing until you redeploy a new version.

**Extra fields** — add to `COLUMNS` in the script *and* to `FIELDS` in
`app/api/contact/route.ts`, or the value is dropped before it reaches Google.

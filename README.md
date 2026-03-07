# UnOffical UPI Global Tracker

> Track every international bank, payment network, and merchant that accepts UPI outside India — real-time, community-powered, always free.

🌐 **Live site:** [upitracker.in](https://upitracker.in)

---

## How it works

The site is a single `index.html` that contains **zero hardcoded data**. On load, `js/app.js` fetches all the JSON files from the `data/` folder and renders every section dynamically.

**To update any content, you only ever edit JSON files. Never touch `index.html` or `app.js`.**

---

## Project structure

```
upi-tracker/
│
├── index.html          # Shell — styles + HTML structure only, no data
├── js/
│   └── app.js          # Fetches data/, renders all sections, wires all events
│
├── data/               # ← THE ONLY PLACE YOU EVER EDIT
│   ├── config.json     # Stats bar, UPI ID, Web3Forms key, latest news bar
│   ├── countries.json  # Country cards with status, region, networks
│   ├── banks.json      # Banks table
│   ├── networks.json   # Payment networks table
│   ├── merchants.json  # Notable merchants grid
│   ├── timeline.json   # Expansion timeline events
│   └── insights.json   # Business insights cards
│
└── README.md
```

---

## Adding or editing data

### Add a new country

Open `data/countries.json` and add an object to the array:

```json
{
  "n": "Indonesia",
  "f": "🇮🇩",
  "r": "asia",
  "s": "pilot",
  "y": "2026",
  "m": "Pilot",
  "nets": ["GoPay", "DANA"],
  "note": "Pilot via NPCI International partnership with Bank Mandiri"
}
```

**Field reference:**

| Field  | Description                                                                 |
|--------|-----------------------------------------------------------------------------|
| `n`    | Country name (display)                                                      |
| `f`    | Flag emoji                                                                  |
| `r`    | Region: `asia` · `europe` · `middleeast` · `africa` · `americas` · `oceania` |
| `s`    | Status: `live` · `pilot` · `mou` · `planned`                               |
| `y`    | Year active / `"—"` if unknown                                              |
| `m`    | Merchant count or description                                               |
| `nets` | Array of payment network names                                              |
| `note` | One-line description shown on the card                                      |

---

### Add a new bank

Open `data/banks.json`:

```json
{ "n": "Bank Mandiri", "c": "Indonesia 🇮🇩", "p": "NPCI International", "t": "bank", "y": "2026", "s": "pilot" }
```

**Field reference:**

| Field | Description                                   |
|-------|-----------------------------------------------|
| `n`   | Bank / entity name                            |
| `c`   | Country + flag emoji                          |
| `p`   | Partnership / clearing entity                 |
| `t`   | Type: `bank` · `network`                      |
| `y`   | Year of partnership                           |
| `s`   | Status: `live` · `pilot` · `mou` · `planned`  |

---

### Add a payment network

Edit `data/networks.json` — same fields as banks above.

---

### Add a merchant

Open `data/merchants.json`:

```json
{ "n": "IKEA UAE", "l": "Dubai, UAE 🇦🇪", "tags": ["Retail", "QR"] }
```

---

### Add a timeline event

Open `data/timeline.json`:

```json
{ "d": "Jan 2026", "t": "Indonesia Pilot Launch", "x": "Bank Mandiri begins UPI QR pilot at 500 merchant locations in Jakarta." }
```

Events are automatically split left/right in the two-column timeline layout.

---

### Update stats bar or latest news

Open `data/config.json`:

```json
{
  "upiId": "siddharths008@icici",
  "web3formsKey": "YOUR_WEB3FORMS_KEY",
  "lastUpdated": "April 2026",
  "latestNews": "Indonesia pilot launched (Jan 2026) · ...",
  "stats": [
    { "value": "21+", "label": "Countries Active or In Pipeline" },
    ...
  ]
}
```

---

## Running locally

Because `app.js` uses `fetch()` to load JSON files, you need a local HTTP server (browsers block `fetch` for `file://` URLs).

**Option 1 — Node.js (recommended):**
```bash
npx serve .
```

**Option 2 — Python:**
```bash
python3 -m http.server 8080
```

**Option 3 — VS Code:**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension and click "Go Live".

Then open `http://localhost:8080` (or whatever port your server uses).

---

## Deploying to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to `main` branch, `/ (root)` folder
4. Your site will be live at `https://your-username.github.io/upi-tracker/`

To use your custom domain `upitracker.in`:
- Add a `CNAME` file in the root containing `upitracker.in`
- Point your domain's DNS to GitHub Pages

---

## Forms (Web3Forms)

Contact and Submit forms use [Web3Forms](https://web3forms.com) — no backend needed.
Your key is stored in `data/config.json` under `web3formsKey`.
To change it, just update that value.

---

## Status reference

| Status    | Meaning                                          | Color    |
|-----------|--------------------------------------------------|----------|
| `live`    | UPI payments fully operational                   | 🟢 Green |
| `pilot`   | Limited / trial rollout underway                 | 🟡 Gold  |
| `mou`     | MoU signed, launch pending                       | 🟣 Purple|
| `planned` | Announced or in discussions, no MoU yet          | ⚫ Grey  |

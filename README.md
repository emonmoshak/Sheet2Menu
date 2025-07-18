# Sheet2Menu – Google Sheets Powered Digital Menu & WhatsApp Ordering

**Restaurant Menu** is a lightweight, low-cost digital menu system designed for small restaurants and food entrepreneurs. It pulls live data from **Google Sheets** so non‑technical owners can update items, prices, stock, and images without touching code. Customers browse a mobile‑friendly menu, add items to a cart, and send the full order to the restaurant through **WhatsApp** in one tap.

---

## ✨ Features
- **Google Sheets CMS:** Update menu items, prices, images, categories, and restaurant settings from a spreadsheet.
- **WhatsApp Ordering:** Cart contents auto‑formatted into a WhatsApp message sent to your restaurant number.
- **Mobile‑First UI:** Optimized for low‑end Android devices and slow networks.
- **Stock Status:** Mark items in / low / out; UI reflects availability.
- **Category Banners:** Eye‑catching backgrounds per category.
- **Offline‑Friendly Assets:** Local image fallbacks; placeholder when image missing.
- **Zero Backend Hosting:** Deploy as static site (GitHub Pages / Netlify / Vercel). No server bills.

---

## 🧩 Project Structure
root/
├── index.html                # Main menu page
├── add-to-cart-page.html     # Cart & checkout (WhatsApp) page
├── assets/                   # Images, logos, fonts, placeholders
├── css/
│   ├── style.css             # Main styling
│   └── cart-page.css         # Cart page styling
├── js/
│   ├── script.js             # Menu rendering + interactions
│   ├── cart.js               # Cart state, totals, WhatsApp link
│   ├── sheets-api.js         # Google Sheets read logic
│   ├── config.js             # Your API key + Sheet ID (replace!)
│   └── whatsapp-config.js    # WhatsApp number & message formatting
├── GOOGLE_SHEETS_SETUP_GUIDE.md
└──

## 🛠️ Quick Start (Local Preview)
1. **Clone:**
   ```bash
git clone YOUR_REPO_URL
cd YOUR_REPO_FOLDER


Open in Browser: Double‑click index.html (works locally for basic UI; Sheets fetch may be blocked by CORS unless hosted via HTTP).

Configure Sheets: See Setup.

Serve Locally (recommended):



python3 -m http.server 8080

visit http://localhost:8080


---

## 🔑 Required Config Values
Edit `js/config.js`:
```js
const SHEETS_API_KEY = "YOUR_GOOGLE_API_KEY"; // from Google Cloud Console
const SHEET_ID       = "YOUR_SPREADSHEET_ID"; // from sheet URL


Edit js/whatsapp-config.js:

const RESTAURANT_WHATSAPP = "+8801XXXXXXXXX"; // full intl format w/ country code
const ORDER_PREFIX = "Restaurant Menu Order"; // appears at start of message


📋 Setup: Google Sheets CMS

Follow the short version below or the full walkthrough in GOOGLE_SHEETS_SETUP_GUIDE.md.

1. Make a Spreadsheet with 3 Tabs

Items

Categories

Config

2. Copy These Column Headers Exactly

Items Sheet

Name

Description

Price

Stock

Image

Margherita Pizza

Classic with fresh basil

650

in

https://.../pizza.jpg

Chicken Biryani

Spiced rice + chicken

220

low

https://.../biryani.jpg

Categories Sheet

Name

Background

Starters

https://.../starters-bg.jpg

Main Dishes

https://.../mains-bg.jpg

Config Sheet

Key

Value

restaurant_name

My Test Cafe

currency_symbol

৳

whatsapp_number

+8801XXXXXXXXX

theme_color

#ff5722

show_unavailable_items

false

Note: Your JS code maps these columns by header text—spelling matters!

🌐 Publish Your Sheet (Read‑Only)

Open your sheet in Google Sheets.

File → Share → Anyone with the link (Viewer).

Copy the sheet URL; grab the ID from between /d/ and /edit.

Enable Google Sheets API in Google Cloud; create API key.

Paste values in config.js.

🔁 How Data Refresh Works

Data is fetched on load.

Cached in memory; can be manually refreshed by reloading.

Optional: add a "Refresh Menu" button (see Enhancements below).

💬 WhatsApp Ordering Flow

User adds items (qty tracked in localStorage).

Cart page builds an order summary line‑by‑line: Qty x Item = Subtotal.

Total appended.

Encoded into a https://wa.me/PHONE?text=... link.

User taps → WhatsApp opens prefilled message to restaurant.




📦 Deployment Options

GitHub Pages (static)
git add .
git commit -m "Initial release"
git push origin main
# In GitHub repo: Settings → Pages → Deploy from Branch

Visit the generated URL (e.g., https://USERNAME.github.io/REPO/).

Netlify (drag & drop)

Drag project folder onto Netlify dashboard.

Set build = none, publish dir = root.

Vercel

Import GitHub repo → Framework = Other → Root = ./.


🛣 Roadmap / Future Work

Promo codes / discounts

Multi‑branch support (select location)

Order history + analytics (Sheets write‑back)

SMS fallback for no‑WhatsApp regions

QR code auto‑generate for tablet menus


🙏 Credits
Built by Md. Emon Moshak for NextStep Hacks 2025. Inspired by needs of small food businesses with limited tech budgets.

---

# 2. Devpost Submission Content (Copy/Paste Template)

Use this to fill out your Devpost project page quickly.

```markdown
## Project Title
Restaurant Menu – Google Sheets → Live Menu → WhatsApp Orders

## Tagline
A zero‑backend digital menu that small restaurants can update from a spreadsheet.

---

## Inspiration
Many small food vendors still print menus—or worse, take orders verbally—because modern POS/ordering systems cost too much, need setup help, or require stable hosting. I wanted to build something **ultra‑light, ultra‑cheap, and easy to update**. If you can edit a spreadsheet, you can run your own digital menu.

---

## What It Does
- Displays a mobile‑friendly menu grouped by categories.
- Pulls live data (items, price, stock, images) from Google Sheets.
- Let customers add items to a cart.
- Generates a structured order message and opens WhatsApp chat with the restaurant.

---

## How I Built It
**Frontend:** HTML, CSS, vanilla JavaScript.
**Data Layer:** Google Sheets API (read‑only) using API Key + published sheet.
**State:** localStorage cart synchronization across pages.
**Messaging:** WhatsApp deep link: `wa.me/<number>?text=<encoded message>`.
**Hosting:** Static hosting (GitHub Pages / Netlify) so any small business can deploy free.

---

## Challenges I Ran Into
- Parsing Google Sheets ranges reliably across tabs (Items, Categories, Config).
- Handling missing/invalid image URLs gracefully.
- Keeping cart state when navigating between static pages.
- URL length limits for very large WhatsApp orders (truncated long menu cases).
- Time constraints: building a working MVP for hackathon deadline (July 19, 2025).

---

## Accomplishments That I'm Proud Of
- Fully working Sheets → UI → WhatsApp flow.
- No backend bills.
- Simple enough for non‑coders to maintain.
- Works on low‑end Android phones common in developing regions.

---

## What I Learned
- Using Google Sheets as a lightweight CMS.
- Encoding structured data into messaging links.
- Designing for low bandwidth & small screens first.
- Rapid MVP scoping under hackathon time pressure.

---

## What's Next
- Admin link to confirm / reject orders.
- Multi‑language (Bangla + English) menus.
- Discount codes & daily specials from Sheet.
- CSV export of orders.

---

## Built With
html · css · javascript · google-sheets-api · whatsapp · netlify (or github-pages)

---

## Try it Out
- **Live Demo:** LIVE_DEMO_URL
- **GitHub Repo:** GITHUB_REPO_URL
- **Video Demo:** YOUTUBE_VIDEO_URL
- **Sample Google Sheet (View Only):** SHEET_SHARE_URL




# AeroLink Visual Assets & Screenshot Gallery

This directory provides a visual walkthrough of the key user interfaces, responsive views, and design systems implemented in **AeroLink**.

---

## 1. Portfolio Screenshot Guide

When showcasing AeroLink on GitHub, LinkedIn, or in engineering portfolios, we recommend capturing the following views:

| Screenshot | File Path | Suggested Viewport | Description |
| :--- | :--- | :--- | :--- |
| **Hero Landing Page** | `docs/screenshots/01-landing-hero.png` | 1920x1080 (Desktop) | Dark SaaS aesthetic, hero headline, interactive test-shortener input card, and feature highlights. |
| **Comprehensive Dashboard** | `docs/screenshots/02-dashboard-metrics.png` | 1920x1080 (Desktop) | Stat metric cards (Total Links, Total Clicks, Active Links, Conversion), search/filter toolbar, and link list. |
| **Link Card & Studio Trigger** | `docs/screenshots/03-link-card.png` | 800x450 (Component) | Detailed link card showing status badge, tags, quick copy, click count, and action buttons. |
| **Advanced Link Creation Modal** | `docs/screenshots/04-create-modal.png` | 1000x800 (Modal) | Modal exhibiting custom alias, expiration date/time, click limits, password protection, tags, and internal notes. |
| **Client-Side QR Studio** | `docs/screenshots/05-qr-studio.png` | 900x700 (Modal) | Instant QR preview canvas with multi-resolution download toggles (150px, 250px, 400px). |
| **Interactive Analytics Suite** | `docs/screenshots/06-analytics-suite.png` | 1920x1080 (Desktop) | Click velocity AreaChart, Device Donut chart, Top Countries/Cities bars, Referrers, and Live Stream. |
| **Password Gateway Screen** | `docs/screenshots/07-password-gateway.png` | 1200x800 (View) | Clean security challenge interface displayed when navigating to a password-protected link. |
| **Mobile Responsive View** | `docs/screenshots/08-mobile-view.png` | 390x844 (iPhone 14) | Mobile-first drawer navigation, collapsed metrics, and touch-optimized link cards. |

---

## 2. Capturing Screenshots Locally

To capture clean, production-ready screenshots of your running instance:

1. **Start the local server:**
   ```bash
   npm run dev
   ```
2. **Open Chrome DevTools** (`F12`), press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac), and type:
   - `Capture full size screenshot` for full-page flows.
   - `Capture node screenshot` for individual cards or modals.
3. Save the resulting image files into this directory (`docs/screenshots/`) using the filenames listed above.

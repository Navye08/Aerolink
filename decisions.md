# AeroLink Redesign — Architectural & Design Decisions Log

This document serves as the permanent register of all key UI/UX, architectural, and design engineering decisions made during the frontend overhaul of **AeroLink**.

The redesign is guided by:
1. **Emil Kowalski's Design Engineering Principles**: Tactile press physics, unseen details that compound, intentional motion, speed as perceived performance, and strict review standards.
2. **Taste Skill Frontend Directives**: High density without box clutter, zero AI clichés (no generic 3-card horizontal rows, no purple glow slop, no filler buzzwords), mathematical grid alignment, and tabular monospace data presentation.
3. **Core Reliability Constraint**: 100% preservation of Supabase schemas, PostgreSQL RPC contracts, authentication flows, routing, and analytics calculation services.

---

## Decision Log

### Decision 001: Compact Metric Ribbon vs. Floating Metric Cards
* **Date**: 2026-09-23
* **Context**: The original dashboard displayed 4 separate floating card components with independent borders, drop shadows, and oversized padding.
* **Choice**: Replaced the separate cards with a single unified 4-segment **Metric Ribbon** (`grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border-subtle bg-surface border rounded-xl overflow-hidden`).
* **Rationale**:
  - Eliminates container noise and visual fragmentation.
  - Treats core telemetry metrics (Total Clicks, Active Links, Unique Visitors, Clicks Today) as a continuous data ribbon.
  - Scales responsively from 2 columns on mobile to 4 columns on desktop without layout shifts.

---

### Decision 002: Strict CSS Grid for Link Rows with Fixed Column Tracks
* **Date**: 2026-09-23
* **Context**: Links were rendered using flexible Flexbox containers (`flex items-center justify-between`). Varying title lengths and tag counts caused column drift across rows, making click counters and status badges unaligned.
* **Choice**: Implemented a strict CSS Grid with defined track widths:
  - `md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_100px_90px_76px]` (5 tracks on tablet landscape 768px–1024px)
  - `lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_100px_90px_70px_76px]` (6 tracks on desktop 1024px+)
* **Rationale**:
  - Enforces pixel-perfect vertical alignment for Status badges, tabular click counts, and action buttons across all rows.
  - On viewports between 768px and 1024px, the secondary `Created Date` track is safely hidden (`hidden lg:block`), preventing column squishing or horizontal scrollbar leaks.

---

### Decision 003: Desktop Column Header Row Above Link Lists
* **Date**: 2026-09-23
* **Context**: Without column headers, users had to infer what numbers and badges represented.
* **Choice**: Added an uppercase micro-header row (`Link Title & Details | Slug & Target | Status | Clicks | Created | Actions`) matching the exact CSS Grid tracks of the rows.
* **Rationale**:
  - Grounds the dataset with clear visual hierarchy matching Linear and Dub SaaS conventions.
  - Automatically hidden on mobile (< 768px) where `LinkCardMobile` cards take over.

---

### Decision 004: Unified Single-Strip Command Toolbar
* **Date**: 2026-09-23
* **Context**: Search inputs, status filter buttons, tag selects, and sort dropdowns were scattered across multiple lines, wrapping unpredictably on 640px–900px viewports.
* **Choice**: Consolidated all query controls into an enclosed single-strip toolbar (`p-1.5 sm:p-2 bg-surface border rounded-xl flex flex-col md:flex-row gap-2 items-stretch md:items-center justify-between`) featuring:
  - Search input with inline clear button (`✕`).
  - Segmented status selector pills (`All`, `Active`, `Disabled`, `Expired`).
  - Native tag dropdown filter.
  - Sort dropdown (`Newest`, `Oldest`, `Most Clicks`, `Least Clicks`).
  - Integrated one-click CSV export button.
  - Active filter badges with instant 1-click **Reset filters** trigger.
* **Rationale**:
  - Eliminates jarring layout jumping.
  - On screens between 640px and 768px, cleanly stacks into a 2-tier arrangement (search full-width on row 1, compact controls on row 2).
  - On screens 768px+, neatly aligns side-by-side.

---

### Decision 005: Tactile Active-Press Physics (`scale-[0.98]`)
* **Date**: 2026-09-23
* **Context**: Buttons only had standard color hover transitions, feeling stiff and unresponsive.
* **Choice**: Integrated Emil Kowalski's active press physics (`active:scale-[0.98] transition-all duration-100 ease-out select-none`) across button primitives.
* **Rationale**:
  - Simulates physical tactile depression, reassuring users that interactive actions have immediately fired.

---

### Decision 006: Responsive Boundaries for Tablet Mobile Cards (640px–768px)
* **Date**: 2026-09-23
* **Context**: Mobile cards had hardcoded `max-w-[200px]` constraints, truncating link titles and URLs even on larger mobile and tablet screens.
* **Choice**: Upgraded truncation constraints to `max-w-[200px] sm:max-w-md` and `max-w-full`.
* **Rationale**:
  - Allows 640px–768px viewports to display informative titles and destination URLs without premature clipping.

---

### Decision 007: Link Detail Page Metric Ribbon & Governance Layout
* **Date**: 2026-09-23
* **Context**: The individual link page (`/link/:id`) had 4 floating cards with disparate heights, a mismatched skeleton, and uneven spacing.
* **Choice**:
  - Adopt the unified 4-segment Metric Ribbon for consistency with the main dashboard.
  - Refactor the right-hand governance sidebar into clean, aligned key-value rows with monospace dates and quota progress meters.
  - Replace `MetricCardSkeleton` in stats loading state with `ChartSkeleton` to prevent layout shift.
* **Rationale**:
  - Seamless mental model between workspace overview and granular link inspection.

---

### Decision 008: Eliminating Marketing AI Clichés & Aligning Landing Page Bento Grid
* **Date**: 2026-09-23
* **Context**: The landing page featured a generic 3-equal-card feature row (banned by Taste Skill rule 7), generic AI copy ("join thousands of developers"), and an outdated preview of the dashboard.
* **Choice**:
  - Convert capabilities into an asymmetric Bento layout: Card 1 (Server-side Passcode Security) spans 2 columns with interactive demonstration; Cards 2 and 3 provide focused features (Lifecycle Governance, Vector QR Studio).
  - Update the embedded dashboard mockup to mirror the actual new Metric Ribbon and CSS Grid rows.
  - Replace marketing buzzwords with concrete, technical copy detailing cryptographic slugging, salted privacy telemetry, and PostgreSQL RPC execution.
* **Rationale**:
  - Delivers a portfolio-grade, authentic product representation that looks engineered, not AI-templated.

---

### Decision 009: Progressive Disclosure in Creation and Edit Modals
* **Date**: 2026-09-23
* **Context**: Creation modal presented all advanced controls (expiration, limit, passcode) in a single overwhelming stack.
* **Choice**: Group into primary fields (Destination, Title, Custom Alias with live preview) and collapsible advanced settings.
* **Rationale**:
  - 80% of links only need a URL and alias; progressive disclosure keeps rapid short-linking fast while retaining deep configurability.

---

### Decision 010: Anti-Emoji Policy & Accessible Micro-Icons
* **Date**: 2026-09-23
* **Context**: In line with the Taste Skill Anti-Emoji mandate, arbitrary decorative emojis (`⚡`, `💡`) in authentication and forms were replaced with clean SVG primitives (`Zap`, `Sparkles`, `CheckCircle2`).
* **Choice**: Standardized all UI status indicators using Lucide micro-icons with semantic color palettes (`text-primary`, `text-emerald-400`, `text-amber-400`, `text-violet-400`).
* **Rationale**:
  - Preserves professional credibility and avoids visual clichés.

---

### Decision 011: Gateway State Resilience & Tactile Interaction Hierarchy
* **Date**: 2026-09-23
* **Context**: Redirect gateway states (`loading`, `password_required`, `expired`, `disabled`, `limit_reached`, `not_found`) required cohesive styling and tactile user transitions.
* **Choice**: Added tactile physical active-press physics (`active:scale-[0.98] transition-all`) across all gateway action triggers and modal dialog buttons (`ConfirmDialog`, `QrModal`, `LinkModal`).
* **Rationale**:
  - Ensures seamless physical responsiveness and perceived speed across all application interactions.

---

### Decision 012: Link Governance Dynamic Threshold Progress Indicators
* **Date**: 2026-09-23
* **Context**: The Click Quota progress bar on `/link/:id` was static in color regardless of usage saturation.
* **Choice**: Implemented dynamic threshold coloring:
  - `< 80%`: `bg-primary` (healthy)
  - `80% – 99%`: `bg-amber-400` (approaching cap warning)
  - `>= 100%`: `bg-rose-500` (quota reached / routing paused)
* **Rationale**:
  - Delivers immediate visual telemetry feedback to workspace administrators without requiring mental arithmetic.

---

### Decision 013: Mobile Navigation Drawer & Shell Transition Optimization
* **Date**: 2026-09-23
* **Context**: Mobile navigation and public header required unified tactile feedback and clear demo mode signaling.
* **Choice**:
  - Standardized `:active` press states across `MobileNav` and `Header` buttons.
  - Aligned user avatar initials fallback logic (`user?.email?.slice(0, 2)?.toUpperCase() || "AL"`).
  - Maintained backdrop-blur navigation bars with clean bottom borders (`border-b border-border-subtle bg-surface/90 backdrop-blur-md`).
* **Rationale**:
  - Seamless responsive consistency between mobile viewports and desktop workstations.



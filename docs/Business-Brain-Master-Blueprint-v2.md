# BUSINESS BRAIN — MASTER BLUEPRINT (v2)
### The AI That Understands Every Business

---

## 1. THE VISION

Business Brain is the digital brain a business owner never had — one system that remembers everything, watches over the business daily, and speaks up before problems happen. Not one app for one business type — a universal core intelligence that adapts to whatever business plugs into it, from a small chemist to a hotel chain.

**The promise:** "My business finally understands itself."

**The build philosophy:** Building starts at the blueprint, not the code. Every module gets researched deeply — real systems, real businesses, real workflows — before a single line is written. Excellence takes years. That is the plan, not a compromise.

---

## 2. THE ARCHITECTURE: UNIVERSAL CORE + ARCHETYPE MODULES

Almost every legitimate business needs to: sell, buy, track money, manage customers, manage inventory or capacity, and make decisions. That shared need is the **Core** — built once, used by everyone. What differs is *how* each type of business does those things — that's what the **Archetype Modules** handle.

### THE CORE (built first, shared by all businesses forever)
| Function | What it does |
|---|---|
| Memory/Recorder | Sales, expenses, customers, suppliers, transactions — logged in seconds |
| Guardian | Watches for problems specific to the connected archetype module, alerts before they bite |
| Daily Briefing | Morning summary: yesterday's numbers, today's priorities |
| Analyst | Finds patterns in the business's own data automatically |
| Advisor | Turns patterns into specific recommendations |
| Natural-Language Search | Ask anything about the business, get an instant answer |
| Payment Collection | Paystack/Flutterwave-powered, rail-agnostic |
| Data Ownership & Export | Full data export anytime — the trust foundation |
| Offline-First Sync | Works on poor connectivity, syncs when back online |
| Discovery Layer (later) | Public business profile, location, customer-facing search |

### THE 10 ARCHETYPE MODULES (researched and built one at a time)

| # | Archetype | Businesses covered | Core need beyond the base system |
|---|---|---|---|
| 1 | **Inventory Retail** | Provision stores, supermarkets, boutiques, shoe/phone/electronics/furniture/book/cosmetics stores, hardware, building materials, agro-input, spare-parts | Stock in/out, reorder points, variant tracking (size/color) |
| 2 | **Regulated Retail (Pharmacy)** | Pharmacies, chemists | Batch & expiry tracking, FEFO, prescription workflow, controlled-substance logs |
| 3 | **Food Production & Dine-In** | Restaurants, fast food, cafés, bakeries, bars | Table/order flow, kitchen tickets, recipe-level ingredient deduction |
| 4 | **Accommodation & Booking** | Hotels, guest houses, resorts, event centres | Room/space availability calendar, no-show handling, channel management |
| 5 | **Appointment Services** | Salons, barbershops, laundry, dry cleaners, car wash, mechanics, tailors, photographers, travel agencies | Booking calendar, service catalog, customer history, light inventory |
| 6 | **Clinical/Health** | Clinics, hospitals, dental, optical, medical labs | Patient records, appointment scheduling, stricter privacy/compliance rules |
| 7 | **Agriculture & Livestock** | Farms, poultry, fish farms, feed distributors | Production cycles, livestock/crop tracking, seasonal planning |
| 8 | **Manufacturing/Production** | Water factories, block industries, furniture factories, garment & soap producers | Raw material → production batch → finished goods inventory |
| 9 | **Professional/Project Services** | Law, accounting, consulting, marketing agencies, software firms, architecture, real estate, construction, interior design, property management | Client/project billing, retainers, time tracking, not physical inventory |
| 10 | **Education & Logistics** | Schools, tutorial/CBT/training centres, driving schools; couriers, haulage, dispatch riders, warehousing | Enrollment/fees/attendance OR shipment/delivery/warehouse tracking |

Every business you listed maps to one of these ten. No business is missing — they are grouped by how they actually operate, which is the only way "universal" is buildable by one person over any number of years.

---

## 3. THE RESEARCH METHOD (per archetype, before building)

For every archetype, before writing a single feature spec:
1. Study 3-5 real existing systems used by that business type (e.g. hotels.ng and hotel PMS software for Archetype 4; pharmacy POS systems for Archetype 2)
2. Identify what problem costs them the most money or time today
3. Identify what a generic "record keeping" app misses for them specifically
4. Talk to real owners in that archetype where possible — same discipline as the original niche-research plan, just repeated once per archetype instead of once total
5. Document the archetype's specific Guardian triggers, Briefing content, and data model before touching code

This research phase is not a delay — it is the actual product design process. Skipping it produces a mediocre generic tool. Doing it produces the "I feel understood" reaction you're building toward.

---

## 3A. ARCHETYPE 1 RESEARCH FINDINGS: INVENTORY RETAIL (COMPLETE)

**Competitive baseline (InkeepX, SwiftPOS, Tracepos, Vendloop, JStock):** real-time stock deduction on sale, low-stock threshold alerts, barcode scan/print, multi-branch transfers, offline-first sync, supplier/purchase tracking, customer credit management, audit trails, P&L reports. Pricing benchmark: free tiers exist; paid plans ₦5,000-7,500/month. **The whole market is stuck at Recorder/Assistant maturity — nobody has reached Analyst, Advisor, or Business Brain.** This is the core gap Business Brain fills.

**Reorder logic:** standard formula is Reorder Point = (Average Daily Sales × Lead Time) + Safety Stock, calculated per-product and per-location. Competitors expect the owner to set and maintain this manually. **Our differentiation:** the Analyst recalculates reorder points automatically from real sales data — the owner never touches a formula, the Guardian just says "reorder rice now" at the right moment.

**Variant tracking (boutiques, shoe/phone shops):** a single item in 5 colors × 6 sizes becomes 30 SKUs ("matrix inventory") — stocking out of one variant while sitting on excess of another loses sales just like a full stockout. Competitors display the matrix grid; **ours narrates it** — "you keep selling out of medium-black within 3 days of restock, large-navy hasn't moved in 6 weeks."

**Shrinkage & theft:** employee theft accounts for ~29% of shrinkage nationally, administrative errors for another meaningful share — not all missing stock is theft. Proven detection: exception reporting (flagging unusual voids/refunds/no-sales/discounts) plus regular cycle counts. **Our differentiation:** distinguish theft-pattern language from likely-error language explicitly, protecting staff trust while still catching real problems — no competitor found does this.

**Debt collection:** best practice is following up within 7-10 days of a missed due date, escalating to firmer contact past 14 days, with the approach calibrated to that customer's payment history (light touch for reliable payers, firmer for chronic late-payers). **Our differentiation:** the Debt Tracker's reminder tone/timing escalates automatically per customer, not a single generic "send reminder" button.

**Supplier management:** the core small-business risk is over-reliance on a single supplier; maintaining a secondary supplier relationship, even via small periodic orders, is the standard hedge. Worth surfacing in the Guardian as a risk flag if 80%+ of purchases route through one supplier.

**Customer loyalty:** retaining an existing customer costs 5-7x less than acquiring a new one; simple mechanics (stamp-card style) reliably outperform complex points systems. Loyalty feature should stay deliberately simple.

**Cash flow vs. profit (the biggest single finding):** a business can look profitable on paper while running out of cash, because money is tied up in unpaid customer debt or supplier payments come due before sales convert to cash — one of the most common causes of small business failure, and invisible in every competitor tool researched. **This is our sharpest differentiator:** the Guardian should explicitly separate "you're profitable" from "you have cash," e.g. "You made ₦180,000 profit this month, but ₦95,000 is tied up in unpaid customer debt — your real cash position is tighter than it looks." This connects the Debt Tracker and Cash-Flow Forecasting features into one genuinely ownable insight nobody else in this market surfaces.

**Also worth a Core-level nudge (not Archetype-specific):** mixing personal and business funds is one of the most common reasons owners lose clarity on real profit margins — a gentle onboarding prompt to separate them belongs in the Core, not just Archetype 1.

---

## 3B. ARCHETYPE 2 RESEARCH FINDINGS: REGULATED RETAIL / PHARMACY (COMPLETE)

**Regulatory foundation:** every pharmacy must register with the Pharmacists Council of Nigeria (PCN) separately from NAFDAC premises registration, with a controlled-substances license required for narcotics. Non-compliance carries real penalties — imprisonment of 6+ months or fines of at least ₦250,000. PPMVs can sell OTC only; prescription dispensing requires a qualified pharmacist on-site.

**Standout finding — counterfeit drugs:** Nigerian regulators estimate roughly half of imported drugs may be counterfeit, with fake antimalarials tied to fatal outcomes. NAFDAC's Mobile Authentication Service (MAS) — an SMS scratch-code verification system — already exists but is a manual, standalone tool nobody has integrated into pharmacy software. **Our differentiation:** build MAS verification into the goods-receiving workflow, with Guardian tracking a per-supplier reliability score based on verification failures. No competitor found does this at the community pharmacy level — a category-defining, life-saving feature.

**Compliance as Guardian function:** given the real penalty for lapsed licenses, the Guardian should track PCN/NAFDAC renewal dates and prompt ahead of expiry — nobody in the market treats compliance as something software watches over.

**Dispensing safety:** prescription errors are well-documented (~75% of prescriptions in one Nigerian hospital study had some error, mostly illegibility/omission). A lightweight completeness check at dispensing (flagging missing dosage/patient info) is an achievable safety net.

**HMO/insurance — deliberately secondary:** HMO coverage sits below 10% in Nigeria; out-of-pocket payments cover 70%+ of healthcare spend. The module should be cash/debt-first like Archetype 1, with HMO claims as a later add-on.

---

## 3C. ARCHETYPE 3 RESEARCH FINDINGS: FOOD PRODUCTION & DINE-IN (COMPLETE)

**Food waste baseline:** 4-10% of restaurant food never reaches a plate, mostly from over-purchasing, poor storage, and prep waste. Industry "solutions" are still largely manual spreadsheet logging even in tools marketed as modern. **Our differentiation:** since recipe-level ingredient deduction is already core to this archetype, waste tracking extends naturally — a wasted dish narrates its cost automatically ("tomato waste unusually high this week, likely prep trimming") instead of requiring a separate manual log.

**Standout finding — delivery aggregator dependency:** Chowdeck and Glovo dominate Nigerian food delivery but face a real trust crisis — a May 2026 investigation found both let a fake restaurant onboard and fulfill real orders undetected, and Chowdeck faces a lawsuit over allegedly inflating menu prices 20-50% without disclosure. More strategically: Chowdeck has acquired restaurant POS tools (Mira) specifically to create vendor lock-in, and Glovo extends working-capital loans repaid from future order cuts — both structural moves to make leaving costly. **Our positioning:** Business Brain should be the neutral, restaurant-owned intelligence layer sitting above every sales channel (in-house, Chowdeck, Glovo, walk-in) rather than something an aggregator can capture — a genuinely current, strategic differentiator, not just a feature. A unified multi-platform order view supports this positioning practically.

---

## 3D. ARCHETYPE 4 RESEARCH FINDINGS: ACCOMMODATION & BOOKING (COMPLETE)

**Nigeria-specific realities:** the two most documented local problems are power outages wiping mid-checkin data and cash-heavy payments making it chaos to track partial/full payment status — both already solved by our offline-first Core and Debt/Payment Tracker applied to room-nights instead of products.

**Booking trust gap:** Hotels.ng reviews reveal guests paying through the platform while the hotel's own system shows no record — a reconciliation gap between booking layer and hotel records. **Our angle:** managing availability and payments directly inside Business Brain (rather than a disconnected third-party booking layer) eliminates this failure mode structurally.

**No-shows:** direct bookings with a deposit run 2-5% no-show rates; OTA bookings without a guarantee can run 20-40%. Deposits and automated reminders are the two most effective levers. **This connects two existing plans:** Guardian nudging deposit collection at booking, and the future Discovery Layer helping hotels get more *direct* bookings — which simultaneously cuts OTA commission and reduces no-show risk.

**Seasonality:** genuine feast-or-famine cycles fit directly into the Planner's seasonal forecasting function. **Deliberately excluded from v1:** overbooking-as-strategy — powerful but risky if automated; if ever built, Advisor-suggested only, never Guardian-executed.

---

## 3E. ARCHETYPE 5 RESEARCH FINDINGS: APPOINTMENT SERVICES (COMPLETE)

**No-shows are the single biggest problem in this archetype**, with 18-30% of appointments lost industry-wide. The fix is well-proven and cheap: online booking alone cuts no-shows ~49%, automated reminders ~29%, and even a small deposit ~65% — stacked together, shops routinely cut no-show rates from 15-20% to under 5%. **Our angle:** deposit-at-booking + automated reminder timing should be a default in this archetype, not an optional toggle — the clearest, most quantifiable Guardian opportunity found across any archetype.

**Defining operational challenge:** barbershops specifically need to manage walk-in queues and pre-booked appointments simultaneously — generic calendar tools don't handle this well. **Our angle:** the Guardian's daily view needs a live merged queue (booked + walk-in), not just a calendar.

**Core-level pattern:** every booking updating client history/preferences automatically reinforces the "notice return gaps" logic already planned in Archetype 1, just triggered by appointment gaps instead of purchase gaps.

---

## 3F. ARCHETYPE 6 RESEARCH FINDINGS: CLINICAL/HEALTH (COMPLETE)

**NDPR compliance:** patient health data is protected under both the National Health Act and NDPR, requiring documented consent before sharing. Enforcement is inconsistent, and Nigerian facilities have documented real patient-record loss from inadequate backup/encryption — an operational risk, not just a compliance checkbox. **This archetype needs the strictest Core settings of any archetype:** mandatory consent capture, non-negotiable backup discipline.

**Standout finding — HMO claims tracking mirrors our Debt Tracker exactly:** Nigerian clinics lose significant revenue to unclaimed/rejected HMO claims from manual paperwork and mismatched diagnosis codes, with zero real-time visibility into aging claims. Documented recovery of ₦400,000-1.5 million in 90 days from switching to an aging-report system (claims grouped 30/60/90+ days). A new law (NIIRA 2025) mandates 60-day claim settlement, giving providers real leverage. **Our angle:** the same debt-aging-and-escalation logic from Archetype 1, reapplied to HMO claims — capture authorization code and plan at booking, track claim age automatically, flag rejections with reason for resubmission, reconcile co-pays alongside cash/POS. Strong validation the Core architecture generalizes correctly.

---

## 3G. ARCHETYPE 7 RESEARCH FINDINGS: AGRICULTURE & LIVESTOCK (COMPLETE)

**Dominant cost driver:** feed accounts for 70-80% of total poultry production expenses in Nigeria — nothing else comes close. Mortality is driven by disease, poor housing/ventilation, and heat stress. Existing tools (e.g. FS Manager) already track bird inventory, feed/water intake, mortality, and expenses — a baseline recorder already exists in this space.

**Our differentiation:** since feed dominates costs this heavily, feed conversion ratio (feed consumed vs. weight gained) is the single most valuable number a farmer can track, and no tool found narrates it — they log raw data only. The Analyst should calculate this automatically per batch and flag deviation ("this batch's feed conversion is worse than your last three — check midday feeding timing"). Mortality-spike detection tied to housing/heat/seasonal patterns extends the same anomaly-detection logic used for shrinkage in Archetype 1.

---

## 3H. ARCHETYPE 8 RESEARCH FINDINGS: MANUFACTURING/PRODUCTION (COMPLETE)

**Real cost threats are external:** erratic power supply forces costly generator reliance, FX volatility hits manufacturers sourcing imported raw materials, and financing carries brutal interest rates (25-40%) when available at all. Margins erode silently month to month.

**Regulatory pattern repeats:** water factories require NAFDAC Good Manufacturing Practice compliance with pre-production inspection — confirming the Compliance Guardian concept isn't pharmacy-specific but a repeating pattern across regulated archetypes, belonging partly in the Core and activated per-archetype.

**Our differentiation:** true per-batch production costing including generator/fuel cost and current input prices, surfacing drift ("cost per unit up 18% this month, mostly from fuel, even though raw material cost is flat") — the manufacturing equivalent of Archetype 1's profit-vs-cash insight.

**Design principle worth stating explicitly:** Archetypes 7 and 8 both confirm a recurring shape — a single "ratio that dominates the business's economics" (feed conversion, cost-per-unit, cash-vs-profit) is consistently our strongest differentiator across archetypes, not a coincidence.

---

## 3I. ARCHETYPE 9 RESEARCH FINDINGS: PROFESSIONAL/PROJECT SERVICES (COMPLETE)

**Core problem is invisible profit leakage.** Scope creep affects 32-52% of all projects industry-wide and is almost always invisible until month-end reconciliation — by then a 100-hour project has quietly become 150, unbillable. One documented example shows margin dropping from 55% to 33% from just 50 unbilled scope-creep hours. Poor time capture compounds this: the gap between average billable-hour capture (72%) and strong capture (95%) costs a mid-sized firm $127,500+/year. A firm that switched to real-time budget-burn alerts (at 75% threshold) cut budget overage by 66% and billed 50% faster.

**Our differentiation:** the same "narrate before it's too late" pattern as every other archetype — Guardian flags budget burn in real time as a project crosses thresholds, rather than waiting for month-end reconciliation nobody has time to do properly.

---

## 3J. ARCHETYPE 10 RESEARCH FINDINGS: EDUCATION & LOGISTICS (COMPLETE)

**Education (schools, tutorial/CBT centres):** the core problem is reconciliation chaos, not refusal to pay — matching hundreds of bank transfers to the right student across part-payments, sibling discounts, and installments, done by hand every term. Digitizing typically improves on-time collection 15-30% and saves 20+ hours/month, purely from removing manual reconciliation. **Our angle:** the Debt Tracker pattern again, but needs structured support for installments/discounts/waivers, not a flat balance.

**Logistics (couriers, dispatch riders, warehousing):** most small Nigerian couriers still run manual, paper-based, cash tracking despite operating in a $10B+ growing market. Fuel price volatility directly erodes dispatch profitability; traffic and poor addressing cause real delivery failures; a NIPOST license is legally required — another compliance item fitting the established pattern. **Our angle:** photo-at-gate proof-of-delivery prevents disputes (already proven valuable by competitors like iCargos), and fuel-cost-per-delivery tracking mirrors the cost-per-unit insight from Manufacturing.

---

Each archetype module gets a real, unhurried build cycle — research, design, build, refine, and get real users in that archetype before moving to the next:

- **Phase 0 (foundation):** Build the Core once — Memory, Guardian engine, Briefing, Search, Payments, offline sync. This is the biggest single investment and everything after reuses it.
- **Phase 1:** Archetype 1 (Inventory Retail) — broadest reach, most familiar territory, validates the Core against a real archetype
- **Phase 2:** Archetype 3 or 4 (Food/Hospitality or Accommodation) — proves the Core flexes to a genuinely different operating pattern
- **Phase 3 onward:** Remaining archetypes, sequenced by research findings on which has the clearest pain and least existing competition — not by guesswork

Each module realistically takes 1-3 months of focused work once the Core exists (your own estimate for hotels was about right) — the Core itself is the part that deserves the most patience, because every mistake there repeats across all ten modules later.

---

## 5A. THE CONTEXTUAL GUARDIAN STANDARD (the core design rule, stated explicitly)

Every archetype's research kept producing the same shape of insight, so it deserves to be named as its own non-negotiable rule rather than left implicit:

**A Guardian alert must connect at least two facts into a forward-looking statement — never report a single number in isolation.**

Not: *"Low stock on rice."*
Instead: *"Rice usually sells out every Thursday. Your supplier is closed tomorrow. Reorder today or you'll likely lose weekend sales."*

This is the actual difference between a recorder and a brain, and it's the one thing a competitor bolting "AI" onto their existing recorder can't easily copy — because it requires the pattern-detection layer (Analyst) and the historical memory (Core) working together, not just a threshold check. Every archetype module's Guardian logic should be built and reviewed against this standard specifically before shipping — if an alert can be rewritten as a single fact with no context, it isn't finished yet.

---

## 5B. SIGNATURE INTELLIGENCE FEATURES (core vision — not deferred, not optional)

These are part of the whole from day one of the blueprint. They don't compete for space with the Core or the Archetype Modules — they layer on top of both, and get built into the plan for every module as it's researched:

- **Cross-Business Intelligence:** anonymized, aggregated insight across users — "cough syrup sales are rising 20% across your city this week." Grows in power as the user base grows; a real moat no single-business tool can copy.
- **WhatsApp-Native Mode:** the Brain works through WhatsApp messages directly, not just inside an app — meets Nigerian traders where they already live.
- **Voice-Based Entry:** speak a transaction ("sold two bags of rice, cash") instead of typing — removes friction for lower-literacy owners.
- **Local Language Support:** Pidgin, Yoruba, Hausa, Igbo for Briefings and alerts — a trust and adoption unlock competitors haven't prioritized.
- **Photo-Based Onboarding:** snap a photo of a paper ledger or stock list; AI reads and digitizes it — removes the single biggest cold-start barrier.
- **Staff Accountability Layer:** per-staff sales logs, manager-approved voids, shift reconciliation — protects against internal leakage.
- **Business Health Score:** one evolving number reflecting cash flow stability, growth trend, and debt ratio.
- **Cash-Flow Forecasting:** predictive, not reactive — warns of a tight week ahead based on real pattern data.
- **Anonymized Benchmarking:** "top 20% of pharmacies in your area this month" — motivating, scale-dependent.
- **Fraud/Anomaly Detection:** flags unusual transaction patterns suggesting theft or error.
- **Embedded Credit/Lending:** 12+ months of real sales data is exactly what a lender needs to assess risk — a future revenue layer built on trust already earned.
- **B2B Trade Layer:** businesses on the platform transacting directly with each other — a genuine network-effect moat.
- **Tax/Compliance Assistant:** auto-generated, region-compliant reports (e.g. FIRS in Nigeria) — removes a dreaded manual chore.
- **Discovery Layer:** public business profiles customers can find by location — turns the platform into two-sided value once enough businesses are on it.

---

## 6. BRAND & DESIGN IDENTITY (locked, research-backed)

A premium, modern feel is part of the trust story, not decoration. Research confirms this isn't just aesthetic preference — Nielsen Norman Group data shows users form first impressions of an interface in about 50 milliseconds, with color as the primary driver, and fintech specifically has the highest design stakes of any product category because users are handing over financial control.

**Why we're not using generic fintech blue:** navy/blue is the default trust color for a reason, but it's also the default for every competitor and every generic fintech template. Since gold signals premium value and dark neutrals signal sophistication in financial products, and since a warm palette also resonates more naturally with the Nigerian market than a cold corporate blue, our identity deliberately departs from the fintech-blue cliché.

**Color tokens (locked):**
- Background (primary): `#16140F` — warm near-black charcoal, not pure black or cold navy
- Surface/card: `#211D17` — slightly lifted warm charcoal
- Primary text: `#F5EFE4` — warm off-white, not stark white
- Accent (brand/CTA): `#D9A344` — muted gold, premium without being gaudy
- Positive state (growth, profit, resolved): `#4F8A6D` — muted sage-emerald
- Caution state (needs attention soon): `#C97B4A` — warm terracotta-amber, calmer than red
- Critical state (overdue, urgent): `#B0503A` — muted rust, used sparingly, never as a dominant color

**Typography:**
- Display/headline (Briefing greeting, key numbers): **Fraunces** — a warm, characterful serif that reads as personal and human, not corporate-cold; used for "Good morning, [name]" and the Briefing's lead sentence specifically
- Body/UI/data: **Inter**, with tabular figures enabled for any column of numbers (prices, totals, ledger entries) so digits align — a fintech-standard practice for numeric legibility
- Dark mode as the primary design (not an afterthought) — now an expected baseline for premium fintech products, not a differentiator, per 2026 design research

**Signature element:** the Daily Briefing opens with a subtle dawn-gradient glow at the top of the screen — a soft warm-to-dark gradient evoking morning light, tying the visual moment to the ritual it represents (a morning check-in from a trusted advisor). This is deliberately not a stat-tile dashboard grid; it reads more like a short note than a control panel, consistent with "progressive disclosure" — showing what matters right now, not everything at once.

**Layout philosophy:** the Briefing is the first screen on login, written as flowing sentences with 2-3 bullet insights, not charts — matching the Contextual Guardian Standard's own voice. Whitespace and restraint communicate premium more than density ever will, and this stays true for low-end Android screens specifically, where cluttered dashboards perform worst.

**Consistency across archetypes:** the visual shell (navigation, Briefing structure, alert card style) stays identical across every archetype module — only the data and terminology change, reinforcing "one brain," not ten different apps stitched together.

---

## 7. COMPETITIVE POSITION (carried forward, still true)

- Existing players (Bumpa, Kippa, OZÉ) are single-archetype recorders, not a universal proactive brain — this remains real white space
- Kippa's 2024 data-loss collapse left ~500,000 merchants burned — data ownership and reliability remain your trust weapon
- Your advantage is not speed to market — it's depth of research and coherence of architecture, which a funded team chasing quarterly growth numbers is structurally unlikely to slow down for
- Weaknesses (distribution, no funding, copyable AI features) are countered the same way regardless of scope: personal depth with early users, going where big players don't bother, referral-driven growth, and a trust-first narrative

---

## ARCHETYPE 1 MVP — LOCKED FEATURE LIST (v1, nothing more)

This is the actual build scope. Anything not listed here is a later version, no exceptions:

**Core (shared foundation):**
- Record a sale in under 10 seconds (Transaction + TransactionLineItem)
- Customer debt ledger with escalating reminder tone (LedgerEntry)
- One-tap WhatsApp/SMS payment reminder
- Basic stock in/out (InventoryMovement)
- Offline-first entry with sync on reconnect
- Data export button
- Paystack/Flutterwave payment collection — funds settle directly, never held in-app

**Archetype 1 Guardian triggers (must satisfy the Contextual Standard — pattern + current state, minimum):**
- Auto-adjusting reorder point per product, narrated ("reorder rice today, you're 2 days past your usual pace")
- Profit-vs-cash divergence alert (the standout Archetype 1 finding)
- Basic shrinkage flag: recorded stock vs. expected stock mismatch, worded as "likely error" unless a clear pattern suggests otherwise
- Overdue debt alert, tone escalating by days overdue

**Explicitly deferred past v1:** variant/matrix tracking (boutiques), supplier reliability scoring, loyalty program, benchmarking, staff accountability layer. These stay in the blueprint's full vision but are not part of the first build.

---

## DEV ENVIRONMENT SETUP

**GitHub structure (monorepo, mirrors the Core + Modules architecture):**
```
business-brain/
├── core/                  → shared: auth, data model, Guardian engine, Briefing generator
├── modules/
│   └── inventory-retail/  → Archetype 1 only, for now
├── mobile/                → React Native or Flutter app shell
├── supabase/
│   ├── migrations/        → SQL schema from the Core Data Model doc
│   └── functions/         → Edge Functions (AI calls, Guardian logic)
└── docs/                  → this blueprint, the data model doc, the interview guide
```

**Supabase setup checklist:**
1. Create project, enable Row-Level Security from day one (non-negotiable given the Clinical archetype's future NDPR requirement — easier to build this discipline in from v1 than retrofit later)
2. Create tables from the Core Data Model doc (Business, User, Customer, Item, Transaction, LedgerEntry, InventoryMovement, GuardianEvent)
3. Set up Auth for owner/staff roles
4. Set up one Edge Function as a placeholder for the Guardian's narration logic — wire it to the LLM API early, even with dummy data, so the "brain" is real from the first commit, not bolted on later

**Immediate next action:** initialize the repo with this structure, migrate the Core schema into Supabase, and get one real screen — the Daily Briefing — rendering with real (even if fake/seeded) data before building anything else.

---

- Don't pretend to know facts the AI doesn't have; don't invent data
- No automatic payments, deletions, or price changes without approval
- No archetype module ships before its research phase is genuinely complete
- The Core must stay archetype-agnostic — if a Core feature only makes sense for one business type, it belongs in a module, not the Core
- Trust is earned by reliability, not by acting confident

---

## IMMEDIATE NEXT STEP (updated — reflects real progress)

Research across all 10 archetypes: COMPLETE. Core data model: DRAFTED (see companion document, Business-Brain-Core-Data-Model.md). Tech stack: DECIDED (Supabase + local-first offline sync + React Native/Flutter + GitHub monorepo). 

**Current step: real interviews with Inventory Retail (Archetype 1) traders**, using the field interview guide, to validate the researched assumptions against real people before any code is written.

# ARCHETYPE 1 MVP — LOCKED FEATURE LIST
### Inventory Retail (provision stores, boutiques, phone/electronics shops, etc.)

This is the actual v1 build scope — nothing here is aspirational, everything here is justified by specific research findings. Anything not on this list is deliberately excluded, with the reason stated, so scope doesn't quietly creep before a single user has touched the product.

---

## BUILD (v1 — the real MVP)

### From the Core
1. **Sales recording** — item, quantity, price, payment method, in under 10 seconds
2. **Debt & Credit Tracker** — who owes what, with auto-escalating reminder tone/timing based on that customer's payment history (research: 7-10 day / 14-day escalation pattern)
3. **Inventory in/out logging** — every stock movement tied to a user_id (research: shrinkage/accountability)
4. **Payment collection** — via Paystack/Flutterwave, settlement direct to owner, never held by the app (research: Bumpa settlement-trust complaints)
5. **Offline-first sync** — works without connectivity, syncs when back online
6. **Daily Briefing** — yesterday's numbers, today's priorities, one sentence, not a dashboard
7. **Data export** — full download anytime, no lock-in (trust weapon vs. Kippa's 2024 collapse)

### Archetype 1-specific
8. **Auto-recalculating reorder alerts** — Guardian computes reorder point from real sales pattern, no manual threshold-setting (research: every competitor requires manual thresholds)
9. **Variant matrix tracking (size/color)** — for boutique/shoe/phone-accessory sellers, with narrated insight, not just a grid (research: matrix inventory pain point)
10. **Cash-vs-profit Guardian alert** — flags when debt owed distorts the real cash position (research: the single strongest differentiator found — no competitor does this)
11. **Shrinkage/exception flagging** — distinguishes likely-theft language from likely-error language explicitly (research: staff trust preservation)
12. **Photo-based onboarding** — snap the paper ledger/stock list, AI digitizes it (research: removes the #1 cold-start adoption barrier)
13. **WhatsApp reminder delivery** — debt/payment reminders sent via WhatsApp, not just in-app (research: traders live in WhatsApp)
14. **Simple loyalty mechanic** — stamp-card style only, not points (research: simple mechanics outperform complex ones)

---

## DEFER (real ideas, not yet — with the reason)

- **Full WhatsApp-native mode** (transacting entirely inside WhatsApp, not just reminders) — bigger build than v1 timeline allows; v1.1 candidate once core proves out
- **Voice-based entry** — valuable but not yet validated as a blocker for this specific archetype's users; revisit after interviews
- **Local language support (Pidgin/Yoruba/Hausa/Igbo)** — real differentiator, but needs translation quality work that shouldn't block initial launch
- **Cross-Business Intelligence / Anonymized Benchmarking** — structurally requires many businesses already using the platform; impossible to build meaningfully at v1 scale
- **Business Health Score / Embedded Lending** — requires 12+ months of real data per business; premature by definition
- **B2B Trade Layer / Discovery Layer** — both are network-effect features; need real user base first
- **Tax/Compliance Assistant** — more urgent for regulated archetypes (Pharmacy, Manufacturing); lower priority for general retail

---

## Why this scope is right-sized

Every "build" item above is traceable to a specific research finding, not a guess — and the list is still small enough for one person to realistically build in the 4-8 week window set out in the original blueprint. Nothing on the "defer" list is being abandoned — it's just sequenced honestly, consistent with the whole build philosophy: blueprint holds everything, hands build one thing at a time.

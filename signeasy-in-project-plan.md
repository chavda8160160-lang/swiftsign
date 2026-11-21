# SignEasy-IN — Digital Signature App for Indian Youth

> **Project Plan & Build Blueprint**
> Created: 2026-11-16 | Status: Pre-development
> Total investment to launch: **₹2,500** (Google Play developer account only)

---

## 1. The Idea (One-liner)

A mobile app that lets users **add their handwritten digital signature to PDFs and images without any quality loss** — built for Indian students, job seekers, and young professionals who sign documents daily.

**Why this works in India:**

- Students sign internship forms, scholarship forms, college submissions, exam applications
- Job seekers sign offer letters, NDAs, onboarding documents
- Rent agreements, bank forms, government applications all need signatures
- Existing apps (Adobe Fill & Sign, DocuSign) are heavy, account-forced, or Western-priced
- Nobody has a **fast, ₹0-entry, no-watermark, India-priced** solution

---

## 2. Core Value Proposition

> "Sign any document in 10 seconds. Free, no watermark, no account, no quality loss."

The **no quality loss** part is the technical differentiator and must be communicated in marketing (most free apps blur/compress the document when exporting).

---

## 3. Feature Specification

### 3.1 MVP Features (Launch)

| # | Feature | Notes |
| --- | --- | --- |
| 1 | Draw signature with finger/stylus | Smooth bezier-curve strokes, adjustable thickness (2–8px), black/blue ink |
| 2 | Import PDF / image | From gallery, files, camera (scan a paper doc) |
| 3 | Place signature freely | Drag, pinch-resize, rotate — anywhere on the page |
| 4 | Lossless export | PDF → vector overlay, re-flattens at native DPI. Image → signature composited as transparent layer onto **original pixels** (no recompression) |
| 5 | Save signature | Reuse without re-drawing |
| 6 | Share/export | WhatsApp, email, Drive, Downloads folder |
| 7 | Multi-page PDF support | Sign same or different signature across pages |

### 3.2 Pro Features (Phase 2)

- Sign **multiple places in one tap** (auto-place on all pages)
- **PDF tools**: reorder pages, rotate, compress, merge
- **Cloud backup** of signatures & signed docs (Firebase)
- Date/stamp/text field insertion
- Signature gallery (full name, initials, short)

### 3.3 Explicitly NOT in scope (avoid scope creep)

- No e-signature certificates / legal Aadhaar-sign integration (huge regulatory cost)
- No document storage platform (we're a tool, not a vault)
- No account requirement for free tier (friction kills downloads)

---

## 4. Pricing & Monetization

### 4.1 Final Structure (agreed 2026-11-16)

| Tier | Price | Features |
| --- | --- | --- |
| **Free** | ₹0 | 3 documents/week, no watermark, 1 saved signature, small banner ad |
| **Basic** | ₹29/month | 15 documents/week, 3 saved signatures, no ads |
| **Pro** | ₹99/month or ₹499/year | Unlimited documents, cloud backup, multi-place signing, PDF tools (reorder/compress/rotate), priority support |

### 4.2 Revenue Math (Realistic)

| Scenario | Paying users | Monthly revenue (gross) | Net after ~20% Play fee |
| --- | --- | --- | --- |
| Month 6 (modest) | 100 (60 Basic + 40 Pro) | 60×29 + 40×99 ≈ ₹5,700 | ~₹4,500 |
| Month 12 (good) | 500 (300 Basic + 200 Pro) | 300×29 + 200×99 ≈ ₹28,500 | ~₹22,800 |
| Month 18 (strong) | 1,500 | ~₹85,000 | ~₹68,000 |

Conversion assumption: 1–2% of active free users → paying. Typical for utility apps.

### 4.3 Payment Implementation

- **Google Play Billing** for compliance (selling digital goods inside the app requires it)
- Enable **alternative billing (India)** — UPI via Razorpay/Cashfree — Google reduced fee (~11–26%), and UPI is what Indian youth actually have
- Price points in ₹: 29, 99, 499 — under the psychological ₹500 line

### 4.4 Guardrails (do NOT do)

- ❌ No "pay to remove watermark" (watermark-free is our brand promise)
- ❌ No dark-pattern subscriptions
- ❌ No ads that interrupt the signing flow (only a small banner on home screen)

---

## 5. Technical Blueprint

### 5.1 Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Flutter** (Dart) | Single codebase → Android + iOS later; huge India talent pool |
| PDF rendering | `pdfrx` or `syncfusion_flutter_pdfviewer` | High-DPI page rendering, overlay support |
| PDF editing | `pdf` / `pdf_manipulator` (or serverless `pdf-lib` via cloud function) | Vector overlay + flatten without rasterizing |
| Signature capture | Custom `CustomPainter` canvas | Bezier smoothing, pressure-less finger input, export transparent PNG @ 1024×512 min |
| Image compositing | `image` package | Alpha-blend signature layer onto original bytes — zero recompression |
| Auth (Pro only) | Firebase Auth (Google sign-in) | Only paying users log in |
| Backend/DB | Firebase (Spark free tier) | Analytics, crashlytics, remote config, cloud storage for Pro |
| Payments | Google Play Billing + Razorpay UPI | Compliance + Indian payment rails |
| Ads | AdMob (banner, home screen only) | Free tier revenue top-up |

### 5.2 The "No Quality Loss" Pipeline (core IP of the app)

```javascript
PDF FLOW:
  PDF page → render at native DPI → signature drawn as vector overlay
  → save as new PDF (annotation/object, NOT screenshot) → file size stays small,
  text stays selectable, zoom stays crisp

IMAGE FLOW:
  Original image bytes → decode → composite transparent signature PNG layer
  → encode back at ORIGINAL format/quality (PNG→PNG lossless, JPEG→same quality)
  → pixel-perfect output
```

This must be unit-tested: input a 300-DPI scanned document, sign it, verify output resolution and that text is still selectable in PDF viewers.

### 5.3 Approximate Code Size

- Signature canvas: ~300 lines
- PDF viewer + overlay: ~400 lines
- Export engine: ~250 lines
- Paywall + Firebase: ~300 lines
- **MVP total: ~1,500–2,000 lines of Dart** — very achievable

---

## 6. Go-to-Market Plan (₹0 Marketing Budget)

### Phase 1 — Soft launch (Weeks 1–4 after store approval)

- Post on r/India, r/IndianStudents, r/developersIndia: "Built a free no-watermark signature app, feedback?"
- Answer signature-related Quora questions linking the app (genuine answers only)
- 5–10 short Instagram reels: "How to sign a PDF on your phone in 10 seconds (free, no watermark)"

### Phase 2 — Reels engine (Weeks 5–12)

- 3 reels/week: scenarios — "Signing your internship offer letter from your hostel", "Rent agreement without a printer"
- Hook formula: problem → 10-sec demo → "free, link in bio"
- Hindi + English + Hinglish captions (massive reach multiplier)
- Collab with 2–3 micro student influencers (₹0–2,000 barter: free Pro)

### Phase 3 — Exam/job-season spikes (Ongoing)

- Content calendar pinned to Indian cycles: admission season (Apr–Jun), internship season (Dec–Feb), govt exam results
- Play Store ASO: title keywords — "sign PDF", "digital signature", "Aadhaar card sign", "document sign app"

### Target metrics (Month 3)

- 5,000+ downloads | 4.2★ rating | <40% day-7 retention is normal for utilities; aim D30 > 15%

---

## 7. Timeline

| Week | Milestone |
| --- | --- |
| 1–2 | Prototype (web demo → Flutter app shell, signature canvas, PDF open) |
| 3–4 | Lossless export engine + image signing + share |
| 5 | Paywall (Play Billing), Firebase analytics, banner ads |
| 6 | Closed testing (20 friends), bug fixes, polish |
| 7 | Play Store listing (screenshots, description, ASO keywords), submit |
| 8 | Public launch + Phase 1 marketing |
| 9–12 | Iterate from reviews, start reels engine |
| 13+ | Pro features (PDF tools, cloud backup), consider iOS |

---

## 8. Budget Summary

| Item | When | Cost |
| --- | --- | --- |
| Google Play developer account | Week 6 | ₹2,500 (one-time) |
| App icon/screenshots design | Optional, can DIY in Canva | ₹0–500 |
| Firebase + tools | Always | ₹0 (free tier) |
| Marketing | Weeks 8+ | ₹0 initially; ₹2,000–5,000 only AFTER downloads show promise |
| **Total to launch** |  | **₹2,500** |

---

## 9. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| "Digital signature" legally means Aadhaar eSign in India | Name app "Sign on PDF/Docs" — we're a signing *tool*, not a legal e-signature service. Add disclaimer in-app: "This is a self-drawn signature image, not a certificate-based e-signature." |
| Google rejects app for policy | Use Play Billing correctly; no misleading claims; privacy policy page (free generator) |
| Free users never convert | Track with Firebase: if <0.5% conversion by month 3, test ₹10 day-pass or adjust Basic limits |
| Competitors copy | Speed + India pricing + reels presence. Tools like this win on distribution, not code |
| Play fee eats margins | Enable alternative UPI billing (India) from day one of monetization |

---

## 10. Next Actions (Owner: You + AI pair-programming)

- [ ] Confirm final name & buy ₹2,500 Play account only when build is 80% done
- [ ] Build web prototype (test the signing UX in a browser, free)
- [ ] Set up Flutter project + signature canvas
- [ ] Implement PDF overlay + lossless export
- [ ] Closed test with 20 friends before spending anything on store

---

*Document version 1.0 — pricing and roadmap agreed 2026-11-16. Next update: after prototype testing.*
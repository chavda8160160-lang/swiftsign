# SwiftSign — Version 3.0 Comprehensive Product, Technical & Business Overview

**Document Version:** 3.0  
**Updated:** 19 November 2026  
**Status:** Feature Complete / Production Candidate  
**Platform:** Hybrid Web (HTML5/ES6) + Native Android (Java / WebViewAssetLoader)  
**Positioning:** *"Sign Documents Privately. Fast, Secure, and 100% On-Device. No Account. No Cloud Upload. Zero Watermarks."*

---

## 1. Executive Summary

**SwiftSign** (evolved from the SignEasy-IN project) is a privacy-first, 100% on-device local processing mobile and web application designed for professionals, small businesses, freelancers, contractors, and individuals worldwide to sign documents and attach official business seals in seconds.

Unlike traditional cloud-based signing services (DocuSign, Adobe Acrobat, CamScanner) that require monthly subscriptions, force account creation, upload confidential contracts to third-party cloud servers, or degrade PDF files into blurry raster screenshots, **SwiftSign executes 100% on the user's local device**.

### Core Promise
1. **100% Local On-Device Processing:** Documents are processed locally on your device. No document uploads to SwiftSign servers. No account required. Files never leave the phone. Zero cloud servers, zero telemetry, zero database storage.
2. **True Lossless Vector Quality:** Embeds signatures and seals directly into PDF stream objects without converting PDF pages into compressed screenshots.
3. **Zero Watermarks Forever:** Clean, professional legal outputs ready for clients, employers, banks, and legal paperwork on all tiers.
4. **Instant 10-Second Workflow:** Open file → Sign / Stamp → Place & Resize → Export / Share.

---

## 2. Technical Architecture & Technology Stack

```
+-----------------------------------------------------------------------------------+
|                                  USER DEVICE                                      |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           SwiftSign UI (HTML5 / CSS3)                       |  |
|  |  * Responsive Mobile-First Design  * SVG Iconography  * Toast Notification  |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|  +-----------------------------------------------------------------------------+  |
|  |                             Core Engine Layer                               |  |
|  |  * CanvasSignature (Bezier Curve Engine, Auto-Crop Bounding Box)            |  |
|  |  * StampGenerator (1-Tap Dates, Name Fields, Official Company Seals)        |  |
|  |  * PaperScanner (CV Paper Subtraction, Transparent Alpha Masking, Recolor)  |  |
|  |  * PlacementManager (Normalized Coordinates 0..1, Gesture Transformations)  |  |
|  |  * CoordinateConverter (PDF User Space Points & Image Natural Dimensions)   |  |
|  |  * ExportEngine (Lossless PDF Stream Embedding & High-Res Image Composite)   |  |
|  |  * StorageManager (Multi-Tier Quota & Anti-Clock Rollback Engine)           |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|  +-----------------------------------------------------------------------------+  |
|  |                           Vendor Library Layer                              |  |
|  |  * pdf-lib.min.js (Object stream byte manipulation & vector embedding)      |  |
|  |  * pdf.js / pdf.worker (Retina backing store & unscaled viewport render)    |  |
|  +-----------------------------------------------------------------------------+  |
|                                         |                                         |
|  +-----------------------------------------------------------------------------+  |
|  |                         Native Android Bridge Layer                         |  |
|  |  * WebViewAssetLoader (HTTPS Virtual Asset Routing: appassets.android...)  |  |
|  |  * Secure SharedPreferences Vault (Auto-backed to Google Drive)             |  |
|  |  * Monotonic System Clock (elapsedRealtime anti-tamper)                     |  |
|  |  * MediaStore & Scoped Storage (Public Downloads & Pictures)                |  |
|  |  * FileProvider (Native WhatsApp, Gmail, Drive Android Share Sheet)        |  |
|  +-----------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

### 2.1 File Structure
```
├── index.html                 # Single-page application markup & modals
├── package.json               # Test scripts & project metadata
├── README.md                  # Project overview & running instructions
├── SwiftSign-Version-3.md     # This comprehensive V3 architecture document
├── server.js                  # Local zero-dependency dev server
│
├── src/
│   ├── css/
│   │   └── styles.css         # Modern clean design, design tokens & responsive CSS
│   └── js/
│       ├── app.js             # Main orchestrator & UI controller
│       ├── canvas-signature.js# Smooth Bezier curve drawing & auto-crop
│       ├── coordinate-converter.js # Point projection & coordinate transforms
│       ├── export-engine.js   # PDF-lib and Canvas high-res export pipeline
│       ├── i18n.js            # Internationalization engine (English & Hindi)
│       ├── image-handler.js   # Image document viewer & natural scaler
│       ├── paper-scanner.js   # Physical paper extraction & alpha masking
│       ├── pdf-handler.js     # PDF.js high-DPI rendering & page management
│       ├── placement-manager.js # Floating placement boxes, drag, rotate, resize
│       ├── stamp-generator.js # Dates, text fields & Official Company Seals
│       └── storage.js         # Quotas, anti-tamper & SharedPreferences sync
│
├── vendor/
│   ├── pdf-lib.min.js         # PDF manipulation library
│   ├── pdf.min.mjs            # PDF.js modern ES module renderer
│   └── pdf.worker.min.mjs     # Off-thread Web Worker for PDF rendering
│
├── android/                   # Full Native Android Studio Project
│   ├── app/
│   │   ├── build.gradle       # SDK 35, MinSdk 24, AndroidX dependencies
│   │   └── src/main/
│   │       ├── AndroidManifest.xml
│   │       ├── assets/        # 1:1 Mirror of Web Application assets
│   │       ├── java/com/swiftsign/app/
│   │       │   └── MainActivity.java # WebViewAssetLoader & AndroidBridge
│   │       └── res/           # Adaptive icons, file provider paths, themes
│   └── gradlew.bat            # Gradle wrapper for Android build automation
│
└── test/                      # 10 Automated Unit Test Suites
    ├── test_pdf_overlay.js
    ├── test_multipage_overlay.js
    ├── test_batch_sign.js
    ├── test_coordinate_converter.js
    ├── test_pdf_handler.js
    ├── test_stamp_generator.js
    ├── test_paper_scanner.js
    ├── test_image_export.js
    ├── test_storage_tamper.js
    └── test_html_integrity.js
```

---

## 3. Comprehensive Feature Matrix

### 3.1 Signature Studio
* **Freehand Bezier Curves:** Velocity-sensitive stroke simulation responsive to fingers, styluses, or mouse input.
* **Colors:** Slate Black (`#0f172a`), Business Blue (`#1d4ed8`), Action Red (`#dc2626`).
* **Stroke Widths:** Fine (2px), Medium (3.5px), Bold (5.5px).
* **Tools:** Undo last stroke, Clear canvas.
* **Auto-Crop Bounding Box:** Tight bounding box detection trims transparent margins so placed signatures never have invisible hitbox collisions.
* **Local Saved Signatures Library:** Stores signatures securely on-device with 1-tap placement and quick deletion.

### 3.2 1-Tap Date Stamp Tool
* **Formats Supported:**
  * Standard: `19 Nov 2026`
  * Slash DMY: `19/11/2026`
  * Slash MDY: `11/19/2026`
  * ISO Format: `2026-11-19`
* **Custom Date Adjustment:** Built-in date picker allows backdating or future-dating agreements.
* **Styling:** Regular vs. Bold segmented toggle, 3 ink colors.

### 3.3 Text & Name Placement
* **Custom Input:** Type name, job title, company designation, or identification number.
* **Quick Templates:** 1-tap chips for `Authorized Signatory`, `Approved`, `Managing Director`, and `Verified`.
* **Styling:** Regular vs. Bold toggle, 3 ink colors.

### 3.4 📷 Paper Signature Scanner (PRO)
* **Camera / File Ingestion:** Takes a photo of a physical ink signature on real paper.
* **Luminosity Extraction Algorithm:** Analyzes RGB pixel brightness against dynamic thresholding.
* **Paper Subtraction:** Extracts ink strokes and converts white or off-white paper into 100% transparent alpha channel.
* **Threshold Adjustment Slider:** Real-time sensitivity tuning for Light Paper, Standard, or Shadows.
* **Ink Recoloring:** Retains Original Ink, converts to Ballpoint Black (`#0f172a`), or Fountain Pen Blue (`#1e40af`).

### 3.5 🏢 Official Company Stamp & Seal Generator (PRO)
* **Dual Stamp Shapes:**
  * **● Round Corporate Seal:** Classic concentric double border, inner security dashed ring, curved company name along top arc, curved location/reg-no along bottom arc, side star separators (`★`), double horizontal notary banner lines, center designation, top star cluster (`★ ★ ★`), and center date.
  * **■ Rectangular Business Stamp:** Double-line rounded box stamp, header `FOR [COMPANY NAME]`, dashed signature guideline, central designation, and subtext/date footer.
* **Instant Default Templates:**
  * ✍️ **Authorized Signatory** (Pre-fills designation, official seal, and stamp blue)
  * 👔 **Director Seal** (Pre-fills `DIRECTOR`, location, and stamp blue)
  * 🟢 **Approved Seal** (Pre-fills `APPROVED`, verified subtext, and official green)
  * 🔴 **Paid Stamp** (Pre-fills `PAID`, accounts dept, and bank red)
* **Designation Chips:** Instant 1-tap chips for `Authorized Signatory`, `Director`, `Approved`, `Verified`, `Paid`.
* **Authentic Ink-Pad Finish:** Realistic micro-perforation and wet-ink rubber texture simulation, or sharp vector mode.
* **Ink Colors:** Rubber Stamp Blue (`#1d4ed8`), Traditional Violet (`#581c87`), Stamp Red (`#b91c1c`), Charcoal Black (`#0f172a`), Forest Green (`#047857`).
* **Auto-Save to Signature Presets:** Option to automatically save the company seal into the signature drawer for 1-tap reuse.

### 3.6 ⎘ Multi-Page "Sign All Pages" Batch Tool (PRO)
* **1-Tap Document-Wide Replication:** Automatically clones the active signature or stamp across every page of multi-page PDFs at identical normalized coordinates.
* **Dual Trigger Points:** Available via the floating `⎘ Pages` pill on the placement box and via the main toolbar button.
* **Collision-Free Design:** Positioned at `bottom: -32px` to prevent overlap with top rotation and delete handles.
* **Smart Visibility:** Automatically hidden on 1-page documents to prevent confusion.

---

## 4. Monetization & Tier Structure

SwiftSign operates on a **Freemium Utility Model**. Core personal signing remains free, private, and watermark-free forever, while high-volume usage and B2B corporate tools monetize via monthly/annual subscriptions.

| Feature / Quota | Free Forever ($0) | Basic ($3.99/mo) | Pro Pass ($9.99/mo or $49/yr) |
| :--- | :--- | :--- | :--- |
| **Weekly Export Quota** | **3 documents / week** | **15 documents / week** | **Unlimited** (`Infinity`) |
| **Saved Signature Slots** | 1 saved signature | 3 saved signatures | **Unlimited** (`Infinity`) |
| **Vector Quality Export** | ✅ Yes (Lossless) | ✅ Yes (Lossless) | ✅ Yes (Lossless) |
| **Watermark & Ads** | 🚫 **Zero Watermarks / No Ads** | 🚫 **Zero Watermarks / No Ads** | 🚫 **Zero Watermarks / No Ads** |
| **1-Tap Date Stamp** | ✅ Included | ✅ Included | ✅ Included |
| **Text & Name Placement** | ✅ Included | ✅ Included | ✅ Included |
| **📷 Paper Signature Scanner**| 🔒 Locked (Pro) | 🔒 Locked (Pro) | ✅ **Full Access** |
| **🏢 Company Stamp & Seal** | 🔒 Locked (Pro) | 🔒 Locked (Pro) | ✅ **Full Access** |
| **⎘ Multi-Page Batch Sign** | 🔒 Locked (Pro) | 🔒 Locked (Pro) | ✅ **Full Access** |

---

## 5. Security & Anti-Tamper Engine

Because SwiftSign runs 100% on-device without an online backend, it implements a **resilient multi-layered anti-tamper system** in `src/js/storage.js`:

1. **Anti-Clock-Rollback (High-Water Mark):**
   * Records the maximum timestamp ever observed.
   * If the user turns their phone calendar backward to circumvent weekly quota resets, the system detects the rollback and enforces the high-water mark.
2. **Anti-Clock-Forward (Monotonic Boot Clock):**
   * Uses `AndroidBridge.getElapsedRealtime()` (hardware monotonic clock since device boot).
   * If the wall-clock time jumps ahead by > 24 hours while elapsed uptime is < 1 hour, the app detects clock manipulation and anchors time to monotonic progression.
3. **Anti-Reinstall Protection:**
   * Utilizes native encrypted Android `SharedPreferences` backed up to the user's Google Drive via Android Auto Backup.
   * Scans public device storage (`Pictures/SwiftSign`, `Downloads/SwiftSign`) to detect previous document exports, preventing fresh reinstalls from clearing usage history.
4. **Universal Dual-Storage Sync:**
   * Reads and writes synchronously across both browser `localStorage` and native Android `SharedPreferences`.

---

## 6. Verification & Automated Test Suites

SwiftSign includes **10 automated unit test suites** executed via `npm test`:

```
> swiftsign@1.0.0 test
> node test/test_pdf_overlay.js && node test/test_multipage_overlay.js && node test/test_batch_sign.js 
  && node test/test_coordinate_converter.js && node test/test_pdf_handler.js 
  && node test/test_stamp_generator.js && node test/test_paper_scanner.js 
  && node test/test_image_export.js && node test/test_storage_tamper.js 
  && node test/test_html_integrity.js
```

1. **`test_pdf_overlay.js`**: Validates PDF point coordinates, byte stream preservation, and lossless vector output.
2. **`test_multipage_overlay.js`**: Verifies multi-page PDF navigation, page indexing, and per-page placement persistence.
3. **`test_batch_sign.js`**: Tests 1-tap replication across all document pages, normalized coordinates, and duplicate prevention.
4. **`test_coordinate_converter.js`**: Tests screen-to-PDF coordinate transformation, rotation angles, and inverted Y-axis calculation.
5. **`test_pdf_handler.js`**: Tests mobile viewport auto-fitting, scale calculations, and High-DPI canvas backing store dimensions.
6. **`test_stamp_generator.js`**: Tests regional date formats, custom backdates, Round Corporate Seals, and Rectangular Stamps.
7. **`test_paper_scanner.js`**: Tests computer-vision binarization, ink bounds detection, and blank paper rejection.
8. **`test_image_export.js`**: Tests high-res image coordinate mapping, aspect ratio preservation, and JPEG/PNG exports.
9. **`test_storage_tamper.js`**: Validates weekly quota tracking, tier upgrades, clock rollback detection, and limit enforcement.
10. **`test_html_integrity.js`**: Syntax parses all JavaScript modules and validates HTML DOM structure.

---

## 7. Legal & Compliance Framework

SwiftSign complies with electronic signature frameworks globally:
* **India:** Information Technology Act, 2000 (Section 4, 5, and 10A).
* **United States:** Electronic Signatures in Global and National Commerce Act (ESIGN Act) & Uniform Electronic Transactions Act (UETA).
* **European Union & UK:** Electronic Identification, Authentication and Trust Services (eIDAS Regulation No 910/2014) for Simple Electronic Signatures (SES).

### Protective Disclaimers
* SwiftSign strictly generates **routine electronic graphical signatures and seals**.
* It includes an explicit disclaimer in export modals:
  > *"Notice: Generates graphical signatures and company stamps for routine business documents. Users are solely responsible for ensuring proper corporate authorization. For statutory notarizations or cryptographic digital signatures (PKI/DSC), consult your local legal requirements."*
* Default seal templates use **generic decorative stars (`★`) and geometric borders**. No restricted government, police, or state emblems are used.

---

## 8. Immediate Next Steps for Production Release

1. **Google Play In-App Billing Client:**
   * Integrate `com.android.billingclient:billing:7.1.1` into `android/app/build.gradle`.
   * Implement real purchase flow for `swiftsign_basic_monthly`, `swiftsign_pro_monthly`, and `swiftsign_pro_yearly` in `MainActivity.java`.
2. **Google Play Console Release:**
   * Generate release AAB bundle via `./gradlew bundleRelease`.
   * Configure store listing screenshots, privacy policy URL, and subscription tiers.
3. **PWA Offline Manifest:**
   * Finalize Service Worker caching for complete offline web browser access.

---

*SwiftSign V3 Architecture Document — Generated 19 November 2026*
